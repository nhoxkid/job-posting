/**
 * Ingestion routes: triggers importing job postings from local structured JSON or payload.
 */

import { Router, type Request, type Response } from 'express'
import { ingestService, type RawListing } from '../services/ingest.service'
import { asyncHandler } from '../utils/asyncHandler'

export const ingestRouter = Router()

ingestRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // If an array of items is passed in the body, ingest them directly.
    // Otherwise, default to reading from the local file server/src/data/listings.json.
    if (req.body && Array.isArray(req.body.items) && req.body.items.length > 0) {
      const result = await ingestService.ingestListings(req.body.items as RawListing[])
      res.json(result)
      return
    }

    const result = await ingestService.ingestFromLocalFile()
    res.json(result)
  }),
)
