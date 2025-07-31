// src/components/PaginatorTest.tsx
import React, { useState } from 'react';
import { Paginator } from 'primereact/paginator'; // Import the Paginator component

const PaginatorTest: React.FC = () => {
    const [firstTest, setFirstTest] = useState<number>(0);
    const [rowsTest, setRowsTest] = useState<number>(10); // Example: 10 rows per page
    const totalRecordsTest = 1000; // Example: 1000 total records

    const onPageChangeTest = (event: any) => {
        setFirstTest(event.first);
        setRowsTest(event.rows);
        console.log("Paginator Test - Page Change Event:", event);
        console.log(`Paginator Test - Current Page: ${(event.first / event.rows) + 1}`);
    };

    return (
        <div className="card">
            <h2>Paginator Test Component</h2>
            <p>Total Records: {totalRecordsTest}</p>
            <p>Rows Per Page: {rowsTest}</p>
            <p>Current First Index: {firstTest}</p>

            <Paginator
                first={firstTest}
                rows={rowsTest}
                totalRecords={totalRecordsTest}
                onPageChange={onPageChangeTest}
                rowsPerPageOptions={[10, 20, 30]} // Include options for testing
            />
        </div>
    );
};

export default PaginatorTest;