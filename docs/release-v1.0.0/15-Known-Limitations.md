# Known Limitations (v1.0.0)

While PowerGuard v1.0.0 is production-ready, there are a few known limitations in the current architecture:

1. **Synchronous AI Inference:**
   The `ReadingProcessor` currently awaits the AI response before continuing. For massive scale (>10,000 meters sending data per second), this could cause backpressure.
   *Workaround:* The system relies on horizontal scaling of both Node.js and FastAPI instances.

2. **Database Archiving:**
   There is no automated script to archive old `MeterReading` rows. The table will grow linearly.
   *Workaround:* DB Admins must manually implement table partitioning or cron-based archiving to cold storage.

3. **Frontend Data Downsampling:**
   The charts display raw data points. For views spanning multiple months, the browser may render thousands of points, impacting performance.
   *Workaround:* The backend API needs a downsampling query parameter (e.g., returning daily averages rather than raw 5-minute ticks).

4. **Multi-Tenancy:**
   The current schema supports different roles but is not strictly multi-tenant (e.g., isolated databases for entirely different Utility Companies). It assumes one deployment per Utility.
