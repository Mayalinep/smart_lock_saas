-- CreateIndex
CREATE INDEX "idx_access_property_active" ON "accesses"("propertyId", "isActive");

-- CreateIndex
CREATE INDEX "idx_access_user_active" ON "accesses"("userId", "isActive");

-- CreateIndex
CREATE INDEX "idx_lock_events_property_ts" ON "lock_events"("propertyId", "timestamp");
