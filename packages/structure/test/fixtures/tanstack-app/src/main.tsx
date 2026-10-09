import './styles.css'
import { createAppRouter } from '#app/utils/createAppRouter'
import { ThemePreferenceProvider } from '#stores/themePreference'

export const router = createAppRouter()
export const Root = () => <ThemePreferenceProvider>{String(router)}</ThemePreferenceProvider>
