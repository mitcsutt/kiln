import type * as PageTree from 'fumadocs-core/page-tree'
import { crumbsOf, neighboursOf, sectionOf, sections } from './pageTree'

const page = (url: string, name: string): PageTree.Item => ({ type: 'page', url, name })

const tree: PageTree.Root = {
  name: 'Docs',
  children: [
    page('/docs', 'Introduction'),
    {
      type: 'folder',
      name: 'UI',
      root: true,
      index: page('/docs/ui', 'Getting started'),
      children: [
        { type: 'folder', name: 'Inputs', children: [page('/docs/ui/inputs/input', 'Input')] },
        page('/docs/ui/checkout', 'Checkout'),
      ],
    },
    {
      type: 'folder',
      name: 'Forms',
      root: true,
      index: page('/docs/forms', 'Overview'),
      children: [
        { type: 'folder', name: 'Fields', children: [page('/docs/forms/fields/text', 'Text')] },
      ],
    },
  ],
}

const url = (item?: PageTree.Item) => item?.url

describe('page tree sections', () => {
  it('lists the root folders', () => {
    expect(sections(tree).map((section) => section.name)).toEqual(['UI', 'Forms'])
  })

  it('finds the section holding a page, its index included', () => {
    expect(sectionOf(tree, '/docs/forms/fields/text')?.name).toBe('Forms')
    expect(sectionOf(tree, '/docs/forms')?.name).toBe('Forms')
    expect(sectionOf(tree, '/docs')).toBeUndefined()
  })

  it('starts the crumbs with the section', () => {
    expect(crumbsOf(tree, '/docs/ui/inputs/input')).toEqual(['UI', 'Inputs'])
    expect(crumbsOf(tree, '/docs/ui')).toEqual(['UI'])
    expect(crumbsOf(tree, '/docs')).toEqual([])
  })

  it('keeps the pager inside a section', () => {
    const forms = neighboursOf(tree, '/docs/forms')
    expect([url(forms.previous), url(forms.next)]).toEqual([undefined, '/docs/forms/fields/text'])
    const field = neighboursOf(tree, '/docs/forms/fields/text')
    expect([url(field.previous), url(field.next)]).toEqual(['/docs/forms', undefined])
    const last = neighboursOf(tree, '/docs/ui/checkout')
    expect([url(last.previous), url(last.next)]).toEqual(['/docs/ui/inputs/input', undefined])
  })

  it('pages the Introduction into the first section', () => {
    expect(url(neighboursOf(tree, '/docs').next)).toBe('/docs/ui')
  })
})
