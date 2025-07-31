import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';

import { InputText } from 'primereact/inputtext';

import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string | null;
    artist_display: string | null;
    inscriptions: string | null;
    date_start: string | null;
    date_end: string | null;
}

interface SelectedArtworksPanelProps {
    selectedItems: Artwork[];
    onRemoveItem?: (id: number) => void;
}

const SelectedArtworksPanel = ({ selectedItems, onRemoveItem }: SelectedArtworksPanelProps) => {
    if (!selectedItems?.length) {
        return <div className="card mt-3"><p>No artworks selected.</p></div>;
    }
    
    return (
        <div className="card mt-3">
            <h3>Selected Artworks ({selectedItems.length})</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {selectedItems.map(item => (
                    <li key={item.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '8px 0', 
                        borderBottom: '1px solid #eee' 
                    }}>
                        <span>{item.title} - {item.artist_display}</span>
                        {onRemoveItem && (
                            <Button
                                icon="pi times"
                                className="p-button-rounded p-button-text p-button-sm p-ml-auto"
                                onClick={() => onRemoveItem(item.id)}
                                aria-label={`Remove ${item.title}`}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};


const ArtworksTable = () => {
    const [rowClick, setRowClick] = useState(false);
    const [apicall, setApicall] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);

    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 12,
        page: 1,
    });

    const overlayPanelRef = useRef<OverlayPanel>(null);
    const [numberInputValue, setNumberInputValue] = useState<number | null>(null);

    const [targetSelectedCount, setTargetSelectedCount] = useState<number | null>(null);
    const [isFillingSelection, setIsFillingSelection] = useState(false);


    const fetchArtworksAndSyncUrl = async (currentPage: number, currentLimit: number, updateUIAndUrl = true): Promise<Artwork[]> => {
        console.log(`[fetchArtworks] Fetching page ${currentPage} with limit ${currentLimit} (UI Update: ${updateUIAndUrl})`);
        if (updateUIAndUrl) {
            setLoading(true);
        }

        try {
            const apiUrl = `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${currentLimit}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("[fetchArtworks] API Response Total:", data.pagination.total);

            if (updateUIAndUrl) {
                setApicall(data.data);
                setTotalRecords(data.pagination.total);

                const newQueryParams = new URLSearchParams();
                newQueryParams.set('page', currentPage.toString());
                newQueryParams.set('limit', currentLimit.toString());
                window.history.pushState(null, '', `?${newQueryParams.toString()}`);
            }

            return data.data;

        } catch (error) {
            console.error("Failed to fetch artworks:", error);
            if (updateUIAndUrl) {
                setApicall([]);
                setTotalRecords(0);
            }
            return [];
        } finally {
            if (updateUIAndUrl) {
                setLoading(false);
            }
            console.log("[fetchArtworks] Loading finished.");
        }
    };

    const handleSelectNRows = async (numToSelect: number) => {
        if (numToSelect <= 0) {
            console.warn("Number to select must be positive.");
            setNumberInputValue(null);
            overlayPanelRef.current?.hide();
            return;
        }

        setLoading(true);
        overlayPanelRef.current?.hide();
        setTargetSelectedCount(numToSelect);

        let remainingToSelect = numToSelect;
        let internalCurrentPage = lazyState.page;
        const originalPage = lazyState.page;
        const originalFirst = lazyState.first;

        let tempSelectedProducts: Artwork[] = [];

        console.log(`[handleSelectNRows] Starting selection of ${numToSelect} items from page ${internalCurrentPage}`);

        while (remainingToSelect > 0) {
            const fetchedArtworks = await fetchArtworksAndSyncUrl(internalCurrentPage, lazyState.rows, false);

            if (!fetchedArtworks || fetchedArtworks.length === 0) {
                console.log("No more artworks available to select from API for N rows.");
                break;
            }

            console.log(`[handleSelectNRows] Processing page ${internalCurrentPage}, found ${fetchedArtworks.length} items, need ${remainingToSelect} more`);

            for (let i = 0; i < fetchedArtworks.length && remainingToSelect > 0; i++) {
                const artwork = fetchedArtworks[i];
                tempSelectedProducts.push(artwork);
                remainingToSelect--;
                console.log(`[handleSelectNRows] Selected item ${artwork.id}, remaining: ${remainingToSelect}`);
            }

            if (remainingToSelect > 0) {
                internalCurrentPage++;
            }
        }

        setSelectedProducts(tempSelectedProducts);
        console.log(`[handleSelectNRows] Final selectedProducts set to: ${tempSelectedProducts.length} items`);

        if (lazyState.page !== originalPage || lazyState.first !== originalFirst) {
            setLazyState({ first: originalFirst, rows: lazyState.rows, page: originalPage });
        } else {
            fetchArtworksAndSyncUrl(originalPage, lazyState.rows, true);
        }

        setLoading(false);
        setNumberInputValue(null);
        console.log(`Initial N-selection complete. Total selected: ${tempSelectedProducts.length}`);
    };

    useEffect(() => {
        if (targetSelectedCount !== null && !isFillingSelection && selectedProducts.length < targetSelectedCount) {
            setIsFillingSelection(true);
            console.log(`[Elastic Select] Current: ${selectedProducts.length}, Target: ${targetSelectedCount}. Filling gap...`);

            const fillSelection = async () => {
                let itemsNeeded = targetSelectedCount - selectedProducts.length;
                let newlySelectedItems: Artwork[] = [];

                const selectedIds = new Set(selectedProducts.map(item => item.id));
                console.log(`[Elastic Select] Initial selected IDs count: ${selectedIds.size}`);

                let currentFetchPage = lazyState.page + 1;
                let maxPagesToSearch = Math.ceil(totalRecords / lazyState.rows);
                let pagesSearched = 0;
                const maxSearchPages = 5;

                while (itemsNeeded > 0 && currentFetchPage <= maxPagesToSearch && pagesSearched < maxSearchPages) {
                    console.log(`[Elastic Select] Searching page: ${currentFetchPage}, Items needed: ${itemsNeeded}`);
                    const fetchedArtworks = await fetchArtworksAndSyncUrl(currentFetchPage, lazyState.rows, false);

                    if (!fetchedArtworks || fetchedArtworks.length === 0) {
                        console.log("[Elastic Select] No more items to find on this page.");
                        currentFetchPage++;
                        pagesSearched++;
                        continue;
                    }
                    console.log(`[Elastic Select] Fetched ${fetchedArtworks.length} items from page ${currentFetchPage}.`);

                    for (const artwork of fetchedArtworks) {
                        if (itemsNeeded > 0 && !selectedIds.has(artwork.id)) {
                            newlySelectedItems.push(artwork);
                            selectedIds.add(artwork.id);
                            itemsNeeded--;
                            console.log(`[Elastic Select] Added item ${artwork.id}. Remaining needed: ${itemsNeeded}`);
                        } else if (selectedIds.has(artwork.id)) {
                             console.log(`[Elastic Select] Item ${artwork.id} already selected. Skipping.`);
                        }
                        if (itemsNeeded === 0) {
                            console.log("[Elastic Select] Found all needed items. Breaking inner loop.");
                            break;
                        }
                    }
                    currentFetchPage++;
                    pagesSearched++;
                }

                if (newlySelectedItems.length > 0) {
                    setSelectedProducts(prev => {
                        const newTotal = prev.length + newlySelectedItems.length;
                        console.log(`[Elastic Select] SUCCESS: Filled ${newlySelectedItems.length} items. New total: ${newTotal}`);
                        return [...prev, ...newlySelectedItems];
                    });
                } else if (targetSelectedCount > 0) {
                    console.warn(`[Elastic Select] Could not fill to target ${targetSelectedCount}. Only ${selectedProducts.length} items available from API.`);
                }
                setIsFillingSelection(false);
                console.log("[Elastic Select] Filling process finished.");
            };

            fillSelection();
        }
    }, [selectedProducts.length, targetSelectedCount, isFillingSelection, totalRecords, lazyState.rows, lazyState.page]);


    useEffect(() => {
        console.log(`[useEffect] Initial mount / URL sync check.`);
        const queryParams = new URLSearchParams(window.location.search);
        let currentPageFromUrl = parseInt(queryParams.get('page') || '1', 10);
        let currentRowsFromUrl = parseInt(queryParams.get('limit') || lazyState.rows.toString(), 10);

        const calculatedFirstFromUrl = (currentPageFromUrl - 1) * currentRowsFromUrl;

        setLazyState({
            first: calculatedFirstFromUrl,
            rows: currentRowsFromUrl,
            page: currentPageFromUrl,
        });

        fetchArtworksAndSyncUrl(currentPageFromUrl, currentRowsFromUrl, true);

    }, []);

    const onLazyLoad = (event: any) => {
        console.log("[onLazyLoad] Event received:", event);
        const newPage = Math.floor(event.first / event.rows) + 1;

        setLazyState({
            first: event.first,
            rows: event.rows,
            page: newPage,
        });

        fetchArtworksAndSyncUrl(newPage, event.rows, true);

        console.log(`[onLazyLoad] State and fetch triggered for page: ${newPage}`);
    };

    return (
        <div className="card">
            <InputSwitch checked={rowClick} onChange={(e) => setRowClick(e.value)} />
            
            {targetSelectedCount !== null && (
                <div style={{
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    color: '#1976d2'
                }}>
                    <i className="pi pi-link" style={{ marginRight: '8px' }}></i>
                    Elastic Selection Active: Maintaining {targetSelectedCount} selected items
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm"
                        style={{ marginLeft: '8px' }}
                        onClick={() => {
                            setTargetSelectedCount(null);
                            console.log('[Elastic Selection] Manually disabled by user');
                        }}
                        aria-label="Disable elastic selection"
                    />
                </div>
            )}

            {console.log("--- DataTable Render ---")}
            {console.log(`DataTable Props: totalRecords=${totalRecords}, rows=${lazyState.rows}, first=${lazyState.first}`)}

            {totalRecords > 0 || loading ? (
                <DataTable
                    key={totalRecords}
                    value={loading || isFillingSelection ? [] : apicall}
                    lazy
                    loading={loading || isFillingSelection}
                    loadingIcon="pi pi-spin pi-spinner"
                    selection={selectedProducts}
                    dataKey="id"
                    selectionMode={rowClick ? null : 'multiple'}
                    onSelectionChange={(e) => {
                        const newSelection = e.value as Artwork[];
                        const previousSelection = selectedProducts;
                        
                        console.log(`[Selection Change] Previous: ${previousSelection.length}, New: ${newSelection.length}, Target: ${targetSelectedCount}`);
                        
                        if (targetSelectedCount !== null && newSelection.length < previousSelection.length) {
                            const deselectedItems = previousSelection.filter(item => 
                                !newSelection.some(newItem => newItem.id === item.id)
                            );
                            
                            if (deselectedItems.length > 0) {
                                console.log(`[Elastic Selection] Item deselected: ${deselectedItems.map(item => item.id).join(', ')}. Need to fill gap. Current: ${newSelection.length}, Target: ${targetSelectedCount}`);
                                setSelectedProducts(newSelection);
                            } else {
                                setSelectedProducts(newSelection);
                            }
                        } else if (targetSelectedCount !== null && newSelection.length > previousSelection.length) {
                            console.log(`[Elastic Selection] User manually selected more items. Clearing elastic mode.`);
                            setTargetSelectedCount(null);
                            setSelectedProducts(newSelection);
                        } else if (targetSelectedCount !== null && newSelection.length === 0) {
                            console.log(`[Elastic Selection] User manually deselected all items. Clearing elastic mode.`);
                            setTargetSelectedCount(null);
                            setSelectedProducts(newSelection);
                        } else {
                            setSelectedProducts(newSelection);
                        }
                    }}
                    stripedRows
                    paginator
                    rows={lazyState.rows}
                    first={lazyState.first}
                    totalRecords={totalRecords}
                    onPage={onLazyLoad}
                    rowsPerPageOptions={[12, 25, 50, 100]}
                >
                    <Column
                        selectionMode="multiple"
                        headerStyle={{
                            width: '5.5rem',
                            padding: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'visible'
                        }}
                        header={
                            <div style={{
                                position: 'absolute',
                                right: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 3,
                            }}
                            >
                                <i
                                    className="pi pi-chevron-down"
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-color-secondary, #6c757d)',
                                    }}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        overlayPanelRef.current?.toggle(event);
                                    }}
                                ></i>
                            </div>
                        }
                    ></Column>
                    <Column field="title" header="Title"></Column>
                    <Column field="place_of_origin" header="Place of Origin"></Column>
                    <Column field="artist_display" header="Artist"></Column>
                    <Column field="inscriptions" header="Inscriptions"></Column>
                    <Column field="date_start" header="Starting Date"></Column>
                    <Column field="date_end" header="Ending Date"></Column>
                </DataTable>
            ) : (
                !loading && totalRecords === 0 && <p>No artworks found or failed to load data.</p>
            )}

            <OverlayPanel ref={overlayPanelRef}>
                <div className="p-fluid" style={{ minWidth: '200px', padding: '10px' }}>
                    <h5>Enter Number of Artworks to Select</h5>
                    <InputText
                        type="number"
                        value={numberInputValue !== null ? numberInputValue.toString() : ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setNumberInputValue(val === '' ? null : parseInt(val, 10));
                        }}
                        placeholder="e.g., 25"
                        className="p-mb-3"
                    />
                    <Button
                        label="OK"
                        icon="pi pi-check"
                        className="p-button-sm"
                        onClick={() => {
                            if (numberInputValue !== null && numberInputValue > 0) {
                                handleSelectNRows(numberInputValue);
                            } else {
                                console.warn("Invalid number entered for selection.");
                                overlayPanelRef.current?.hide();
                                setNumberInputValue(null);
                            }
                        }}
                    />
                </div>
            </OverlayPanel>
        </div>
    );
};

export default ArtworksTable;