import { NextRequest } from "next/server";

// Mock transaction data
const mockTransactions = [
    {
        date: '2023-08-24',
        referenceId: '#B4364346342',
        to: 'Bloom Enterprise Sdn Bhd',
        description: 'Recipient references will go here',
        type: 'DuitNow payment',
        amount: 1200.00
    },
    {
        date: '2023-07-16',
        referenceId: '#B4364346342',
        to: 'Muhammad Andy Asmawi',
        description: 'Recipient references will go here',
        type: 'DuitNow payment',
        amount: 54810.16
    },
    {
        date: '2023-07-12',
        referenceId: '#B4364346342',
        to: 'Utilities Company Sdn Bhd',
        description: 'Recipient references will go here',
        type: 'DuitNow payment',
        amount: 100.00
    },
    {
        date: '2023-07-08',
        referenceId: '#B4364346343',
        to: 'Tech Solutions Malaysia',
        description: 'Monthly software subscription',
        type: 'DuitNow payment',
        amount: 299.99
    },
    {
        date: '2023-07-05',
        referenceId: '#B4364346344',
        to: 'Grocery Mart Sdn Bhd',
        description: 'Weekly grocery purchase',
        type: 'DuitNow payment',
        amount: 156.75
    },
    {
        date: '2023-07-02',
        referenceId: '#B4364346345',
        to: 'Petrol Station Services',
        description: 'Fuel payment',
        type: 'DuitNow payment',
        amount: 85.50
    },
    {
        date: '2023-06-28',
        referenceId: '#B4364346346',
        to: 'Online Shopping Platform',
        description: 'Electronics purchase',
        type: 'DuitNow payment',
        amount: 1850.00
    },
    {
        date: '2023-06-25',
        referenceId: '#B4364346347',
        to: 'Restaurant ABC',
        description: 'Dinner payment',
        type: 'DuitNow payment',
        amount: 127.80
    }
];

export async function GET(req: NextRequest) {
    try {
        // In a real application, you would:
        // 1. Verify the JWT token from headers
        // 2. Extract user ID from token
        // 3. Query database for user's transactions
        // 4. Apply pagination, filtering, etc.

        // For demo purposes, we'll return mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

        return Response.json({
            success: true,
            transactions: mockTransactions,
            totalCount: mockTransactions.length,
            page: 1,
            limit: 50
        });

    } catch (error) {
        console.error('Transaction API error:', error);
        return Response.json({
            error: 'Failed to fetch transactions',
            transactions: []
        }, { status: 500 });
    }
}