const axios = require('axios');

// Get OAuth access token from Safaricom
const getAccessToken = async () => {
    const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}` } }
    );

    return response.data.access_token;
};

// Generate password for STK Push
const generatePassword = () => {
    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);

    const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
};

// Initiate STK Push
const initiateSTKPush = async ({ phone, amount, accountReference, transactionDesc }) => {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    // Format phone number — ensure it starts with 254
    let formattedPhone = phone.toString().replace(/^0/, '254').replace(/^\+/, '');
    if (!formattedPhone.startsWith('254')) {
        formattedPhone = `254${formattedPhone}`;
    }

    const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: formattedPhone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data;
};

// Query STK Push status
const querySTKStatus = async (checkoutRequestID) => {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
        {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data;
};

module.exports = { initiateSTKPush, querySTKStatus, getAccessToken };
