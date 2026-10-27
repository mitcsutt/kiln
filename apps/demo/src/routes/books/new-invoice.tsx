import { createFileRoute } from '@tanstack/react-router'

import { NewInvoice } from '#features/books/pages/NewInvoice'

export const Route = createFileRoute('/books/new-invoice')({ component: NewInvoice })
