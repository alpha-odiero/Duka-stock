-- Add the ONLINE_ORDER and PURCHASE values to StockMovementType so order and
-- purchase flows can record distinct movements (SALE was renamed to POS_SALE).
ALTER TYPE "StockMovementType" ADD VALUE IF NOT EXISTS 'ONLINE_ORDER';
ALTER TYPE "StockMovementType" ADD VALUE IF NOT EXISTS 'PURCHASE';
