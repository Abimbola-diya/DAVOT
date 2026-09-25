# Implementation Plan: Connected Production Data Flow & Record Batch Modal Refinement

## 1. Executive Summary & Architectural Overview
The goal of this update is to establish **strict end-to-end data connectivity** across all DAVOT farm management modules—specifically connecting **Harvest Records**, **Harvest Batches**, and **Product Processing**.

Instead of allowing users to manually enter raw material weights (e.g., FFB Processed or PK Processed) in isolation on the Products page, the system will now enforce a cascading selection model:
1. Every production run is tied to a specific **Harvest Record** (e.g. `HV-014`).
2. Selecting a Harvest reveals the specific **Harvest Batches** logged under that harvest.
3. Selecting a Harvest Batch **automatically populates the FFB weight** directly from that batch record.
4. The user only records the resulting **Finished Products Produced** (CPO, PKO, PKC).

---

## 2. Connected Data Relationship

```mermaid
graph TD
    H[Harvest Record: HV-014] --> B1[Harvest Batch #1 - FFB: 1,280 kg]
    H --> B2[Harvest Batch #2 - FFB: 1,500 kg]
    H --> B3[Harvest Batch #3 - FFB: 1,720 kg]

    B1 -->|Selected in Production Modal| P1[Processing Batch: PB-024]
    P1 -->|Auto-Populates| FFB[FFB Input: 1,280 kg (Read-Only)]
    P1 -->|User Inputs Outputs| CPO[Crude Palm Oil: 230 L]
    P1 -->|User Inputs Outputs| PKO[Palm Kernel Oil: 80 L]
    P1 -->|User Inputs Outputs| PKC[Palm Kernel Cake: 150 kg]
```

---

## 3. Modal Form Modifications (Record Processing Batch)

### A. Cascading Selection Flow
- **Step 1: Parent Harvest Selection (`formHarvestId`)**
  - Dropdown populated with available `HarvestRecord`s (e.g., `HV-014`, `HV-015`).
- **Step 2: Batch Selection (`formBatchId`)**
  - Dynamically rendered dropdown listing all batches belonging to the selected `formHarvestId`.
  - Displays batch label with date and FFB weight (e.g., `Batch #1 (2026-09-24) - 1,280 kg`).
- **Step 3: Auto-Populated Raw Material Display**
  - Read-only display badge showing the exact `FFB Weight` fetched from the chosen batch.
  - Manual text input for FFB Processed is removed.

### B. Input Field Changes

| Field | Old Implementation | Proposed Implementation | Reason |
| :--- | :--- | :--- | :--- |
| **Harvest Select** | Simple Harvest ID text/select | Cascading `HarvestRecord` select | Ties production to actual harvest |
| **Batch Select** | Missing | Dynamic dropdown based on chosen harvest | Pinpoints exact batch being processed |
| **FFB Processed** | Manual number input | **Auto-populated & read-only** from selected batch | Data integrity & single source of truth |
| **PK Processed** | Manual number input | **Removed** | Derived/tracked via batch history |
| **Yield Rates Banner** | Live auto-calculated yield box | **Removed** | Streamlines form UI and avoids clutter |
| **Finished Products** | Manual inputs for CPO, PKO, PKC | **Retained (CPO, PKO, PKC inputs)** | Primary recordable outputs |

---

## 4. Technical File Impact Analysis

### 1. `frontend/src/types.ts`
- Enhance `ProductBatch` interface to include `harvest_batch_id?: string` to link directly to a `HarvestBatch`.

```typescript
export interface ProductBatch {
  id: string;
  harvest_id: string;
  harvest_batch_id?: string;
  date: string;
  ffb_processed_kg: number;
  cpo_produced_litres: number;
  pko_produced_litres: number;
  pkc_produced_kg: number;
  notes?: string;
}
```

### 2. `frontend/src/components/ProductView.tsx`
- **State Updates**:
  - Add state `formBatchId: string` inside modal.
  - Auto-update `formFfbKg` when `formBatchId` changes based on matching batch in `harvestRecords`.
- **UI Updates**:
  - Replace manual raw material inputs in `Record Processing Batch` modal with cascading harvest & batch selectors.
  - Render read-only FFB weight badge.
  - Remove manual `PK Processed` field.
  - Remove auto-calculated yield rates banner.

---

## 5. Step-by-Step Execution Strategy

1. **Type Definition Alignment**: Update `ProductBatch` in [`types.ts`](file:///home/abimbola/Desktop/DAVOT/frontend/src/types.ts).
2. **Modal Form Refactoring**: Update modal component logic in [`ProductView.tsx`](file:///home/abimbola/Desktop/DAVOT/frontend/src/components/ProductView.tsx).
3. **Verification**: Run `npm run build` in `/home/abimbola/Desktop/DAVOT/frontend` to verify 100% clean TypeScript compilation.
