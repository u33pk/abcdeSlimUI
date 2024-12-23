import { createPageLoadingGuard } from './page-loading-guard'
import { createPageTitleGuard } from './page-title-guard'

export function setupRouterGuards(router) {
  createPageLoadingGuard(router)
  createPageTitleGuard(router)
}
