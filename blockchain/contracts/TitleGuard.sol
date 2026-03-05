// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TitleGuard
 * @notice Blockchain-based property document authentication for the Kenyan market.
 * @dev Stores SHA-256 document hashes mapped to parcel numbers on Polygon Amoy Testnet.
 */
contract TitleGuard {
    // Mapping from parcel number to registered document hash
    mapping(string => bytes32) private parcelToHash;

    // Mapping to track which parcels are registered
    mapping(string => bool) private parcelRegistered;

    // Mapping to track document hash existence (for cross-parcel duplicate detection)
    mapping(bytes32 => string) private hashToParcel;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a document is successfully registered
    event DocumentRegistered(
        string indexed parcelNumber,
        bytes32 documentHash,
        address registeredBy,
        uint256 timestamp
    );

    /// @notice Emitted when a document is verified (authentic match)
    event DocumentVerified(
        string indexed parcelNumber,
        bytes32 documentHash,
        bool isAuthentic,
        uint256 timestamp
    );

    /// @notice Emitted when a conflict (potential fraud) is detected
    event ConflictDetected(
        string indexed parcelNumber,
        bytes32 expectedHash,
        bytes32 providedHash,
        address checkedBy,
        uint256 timestamp
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ParcelAlreadyRegistered(string parcelNumber);
    error HashAlreadyRegistered(bytes32 documentHash, string existingParcel);
    error ParcelNotRegistered(string parcelNumber);
    error InvalidInput();

    // ─── Functions ────────────────────────────────────────────────────────────

    /**
     * @notice Register a document's hash under a parcel number.
     * @param parcelNumber The unique land parcel identifier (e.g., "LOC123/456")
     * @param documentHash SHA-256 hash of the title deed document (as bytes32)
     */
    function registerDocument(
        string calldata parcelNumber,
        bytes32 documentHash
    ) external {
        if (bytes(parcelNumber).length == 0) revert InvalidInput();
        if (documentHash == bytes32(0)) revert InvalidInput();

        // Check if parcel already registered
        if (parcelRegistered[parcelNumber]) {
            revert ParcelAlreadyRegistered(parcelNumber);
        }

        // Check if this exact hash is already registered under a different parcel
        if (bytes(hashToParcel[documentHash]).length > 0) {
            revert HashAlreadyRegistered(documentHash, hashToParcel[documentHash]);
        }

        // Store the registration
        parcelToHash[parcelNumber] = documentHash;
        parcelRegistered[parcelNumber] = true;
        hashToParcel[documentHash] = parcelNumber;

        emit DocumentRegistered(parcelNumber, documentHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify whether a document hash matches the registered hash for a parcel.
     * @param parcelNumber The land parcel identifier to verify against
     * @param documentHash The hash of the document being verified
     * @return isAuthentic True if the document hash matches the registered one
     */
    function verifyDocument(
        string calldata parcelNumber,
        bytes32 documentHash
    ) external returns (bool isAuthentic) {
        if (!parcelRegistered[parcelNumber]) {
            revert ParcelNotRegistered(parcelNumber);
        }

        bytes32 registeredHash = parcelToHash[parcelNumber];
        isAuthentic = (registeredHash == documentHash);

        if (isAuthentic) {
            emit DocumentVerified(parcelNumber, documentHash, true, block.timestamp);
        } else {
            emit ConflictDetected(
                parcelNumber,
                registeredHash,
                documentHash,
                msg.sender,
                block.timestamp
            );
            emit DocumentVerified(parcelNumber, documentHash, false, block.timestamp);
        }

        return isAuthentic;
    }

    /**
     * @notice Get the registered hash for a parcel number (view only, no event).
     * @param parcelNumber The land parcel identifier
     * @return The registered document hash
     */
    function getDocumentHash(string calldata parcelNumber)
        external
        view
        returns (bytes32)
    {
        if (!parcelRegistered[parcelNumber]) {
            revert ParcelNotRegistered(parcelNumber);
        }
        return parcelToHash[parcelNumber];
    }

    /**
     * @notice Check if a parcel number has already been registered.
     * @param parcelNumber The land parcel identifier
     * @return True if the parcel is registered
     */
    function isParcelRegistered(string calldata parcelNumber)
        external
        view
        returns (bool)
    {
        return parcelRegistered[parcelNumber];
    }

    /**
     * @notice Find which parcel a given document hash is registered under.
     * @param documentHash The document hash to look up
     * @return The parcel number (empty string if not found)
     */
    function getParcelByHash(bytes32 documentHash)
        external
        view
        returns (string memory)
    {
        return hashToParcel[documentHash];
    }
}
