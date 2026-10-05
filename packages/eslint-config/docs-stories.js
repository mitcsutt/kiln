import { defineConfig } from 'eslint/config'

import { STORY_FILES } from './globs.js'

/** The story tag that puts a story on the docs site. */
const DOCS_TAG = 'docs'

/**
 * An ESTree node, read loosely: the rule only looks at a few fields of a few node types.
 *
 * @typedef {{ type: string, range?: [number, number], [key: string]: unknown }} AnyNode
 */

/**
 * @param {unknown} node
 * @returns {AnyNode | undefined}
 */
function asNode(node) {
  return node && typeof node === 'object' && 'type' in node
    ? /** @type {AnyNode} */ (node)
    : undefined
}

/**
 * `meta satisfies Meta`, `story as Story`: the expression underneath.
 *
 * @param {AnyNode | undefined} node
 * @returns {AnyNode | undefined}
 */
function unwrap(node) {
  if (node && (node.type === 'TSSatisfiesExpression' || node.type === 'TSAsExpression')) {
    return unwrap(asNode(node.expression))
  }
  return node
}

/**
 * @param {AnyNode | undefined} object
 * @param {string} name
 * @returns {AnyNode | undefined}
 */
function property(object, name) {
  if (object?.type !== 'ObjectExpression') return undefined
  for (const element of /** @type {AnyNode[]} */ (object.properties)) {
    const key = asNode(element.key)
    if (element.type === 'Property' && key?.type === 'Identifier' && key.name === name) {
      return asNode(element.value)
    }
  }
  return undefined
}

/**
 * The string tags of a meta or story object.
 *
 * @param {AnyNode | undefined} object
 * @returns {string[]}
 */
function tags(object) {
  const list = property(object, 'tags')
  if (list?.type !== 'ArrayExpression') return []
  return /** @type {AnyNode[]} */ (list.elements).flatMap((element) =>
    element.type === 'Literal' && typeof element.value === 'string' ? [element.value] : [],
  )
}

/**
 * @param {AnyNode} outer
 * @param {{ range?: [number, number] }} inner
 */
function within(outer, inner) {
  return (
    outer.range !== undefined &&
    inner.range !== undefined &&
    inner.range[0] >= outer.range[0] &&
    inner.range[1] <= outer.range[1]
  )
}

/**
 * `kiln/docs-story`: a story the docs site shows is code a reader can copy. A story is a docs
 * story when it's tagged `docs`, one story at a time: the tag never goes on the meta. Every other
 * story is a workbench story, and the rule leaves it alone. A docs story needs:
 *
 * - a JSDoc comment, which the docs show as its caption;
 * - a `render` function that takes no args, which the docs show as its code;
 * - nothing in that code, or in the file's helpers it reaches, imported with a relative or `#`
 *   path, so the code works when copied; and no `style` attribute, so layout uses components.
 *
 * A `Playground` is the workbench's controls story, so it is never a docs story.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export const docsStory = {
  meta: {
    type: 'problem',
    docs: { description: 'A story the docs site shows is code a reader can copy.' },
    schema: [],
    messages: {
      meta: "Tag each docs story 'docs', not the meta: a docs example is chosen one story at a time.",
      playground:
        "A Playground is the workbench's controls story. Write a docs story of its own instead.",
      jsdoc:
        "A docs story needs a JSDoc comment: the docs show it as the caption. Or remove its 'docs' tag.",
      render:
        "A docs story needs a `render` function that takes no args: the docs show its code. Or remove its 'docs' tag.",
      importPath:
        "`{{name}}` comes from '{{source}}', so the docs story's code wouldn't work when copied. Import it from a package, or remove the story's 'docs' tag.",
      style:
        'A docs story lays out with components (`Inline`, `Stack`, `Grid`), not `style`: readers copy this code.',
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      'Program:exit'(program) {
        const statements = /** @type {AnyNode[]} */ (/** @type {unknown} */ (program.body))
        const moduleScope = sourceCode.scopeManager.scopes.find((scope) => scope.type === 'module')
        if (!moduleScope) return

        /** @param {string} name */
        const declaratorOf = (name) => {
          const definition = moduleScope.set.get(name)?.defs[0]
          return definition?.type === 'Variable' ? asNode(definition.node) : undefined
        }

        const exportDefault = statements.find((node) => node.type === 'ExportDefaultDeclaration')
        let meta = unwrap(asNode(exportDefault?.declaration))
        if (meta?.type === 'Identifier') {
          meta = unwrap(asNode(declaratorOf(/** @type {string} */ (meta.name))?.init))
        }
        if (meta && tags(meta).includes(DOCS_TAG)) {
          context.report({
            node: /** @type {import('eslint').Rule.Node} */ (/** @type {unknown} */ (meta)),
            messageId: 'meta',
          })
        }

        /**
         * @param {AnyNode} node
         * @param {(node: AnyNode) => void} visit
         */
        const walk = (node, visit) => {
          visit(node)
          for (const key of sourceCode.visitorKeys[node.type] ?? []) {
            const value = node[key]
            for (const child of Array.isArray(value) ? value : [value]) {
              const childNode = asNode(child)
              if (childNode) walk(childNode, visit)
            }
          }
        }

        /**
         * A node's module-level dependencies: every reference inside it that resolves to the
         * file's top level, followed through helpers until nothing new is reached.
         *
         * @param {AnyNode} start
         */
        const check = (start) => {
          /** @type {Set<AnyNode>} */
          const seen = new Set()
          // One report per import, however often the story's code uses it.
          /** @type {Set<string>} */
          const reported = new Set()
          const queue = [start]
          for (let node = queue.pop(); node; node = queue.pop()) {
            if (seen.has(node)) continue
            seen.add(node)
            walk(node, (child) => {
              const name = asNode(child.name)
              if (child.type === 'JSXAttribute' && name?.name === 'style') {
                context.report({
                  node: /** @type {import('eslint').Rule.Node} */ (/** @type {unknown} */ (child)),
                  messageId: 'style',
                })
              }
            })
            for (const scope of sourceCode.scopeManager.scopes) {
              for (const reference of scope.references) {
                const variable = reference.resolved
                if (!within(node, reference.identifier) || variable?.scope !== moduleScope) {
                  continue
                }
                for (const definition of variable.defs) {
                  if (definition.type === 'ImportBinding') {
                    const source = String(
                      /** @type {{ source: { value: unknown } }} */ (
                        /** @type {unknown} */ (definition.parent)
                      ).source.value,
                    )
                    if (/^[.#]/.test(source) && !reported.has(variable.name)) {
                      reported.add(variable.name)
                      context.report({
                        node: reference.identifier,
                        messageId: 'importPath',
                        data: { name: variable.name, source },
                      })
                    }
                  } else {
                    const next = asNode(definition.node)
                    if (next) queue.push(next)
                  }
                }
              }
            }
          }
        }

        for (const statement of statements) {
          const declaration = asNode(statement.declaration)
          if (
            statement.type !== 'ExportNamedDeclaration' ||
            declaration?.type !== 'VariableDeclaration'
          ) {
            continue
          }
          for (const declarator of /** @type {AnyNode[]} */ (declaration.declarations)) {
            const story = unwrap(asNode(declarator.init))
            if (story?.type !== 'ObjectExpression' || !tags(story).includes(DOCS_TAG)) continue
            const id = asNode(declarator.id)
            const target = /** @type {import('eslint').Rule.Node} */ (/** @type {unknown} */ (id))
            if (id?.name === 'Playground') {
              context.report({ node: target, messageId: 'playground' })
            }
            const jsdoc = sourceCode
              .getCommentsBefore(
                /** @type {import('eslint').Rule.Node} */ (/** @type {unknown} */ (statement)),
              )
              .at(-1)
            if (jsdoc?.type !== 'Block' || !jsdoc.value.startsWith('*')) {
              context.report({ node: target, messageId: 'jsdoc' })
            }
            const render = property(story, 'render')
            const isFunction =
              render?.type === 'ArrowFunctionExpression' || render?.type === 'FunctionExpression'
            if (!render || !isFunction || /** @type {unknown[]} */ (render.params).length > 0) {
              context.report({ node: target, messageId: 'render' })
              continue
            }
            check(render)
          }
        }
      },
    }
  },
}

/** The plugin that carries `kiln/docs-story`. */
export const plugin = {
  meta: { name: '@mitcsutt/kiln-eslint-config/docs-stories' },
  rules: { 'docs-story': docsStory },
}

/**
 * Stories as docs examples: a story tagged `docs` is code readers copy, so `kiln/docs-story`
 * keeps it copy-safe. Combine it with `storybook`.
 */
export default defineConfig({
  name: 'kiln/docs-stories',
  files: STORY_FILES,
  plugins: { kiln: plugin },
  rules: { 'kiln/docs-story': 'error' },
})
