import { formOptions, kit } from '@mitcsutt/kiln-forms'

import { STUDIO_SETTINGS } from '#features/studio/data/members'
import { ConeField } from '#features/studio/pages/Settings/components/ConeField'

/** The default kit plus the studio's own field: `form.ConeField` from here on. */
export const settingsKit = kit.extend({ fields: { cone: ConeField } })

/** Shared by the settings form and the components that read it from context. */
export const settingsOptions = formOptions({ defaultValues: STUDIO_SETTINGS })
