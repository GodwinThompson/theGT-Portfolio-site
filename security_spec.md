# Security Specification - GraphixPortfolio

## Data Invariants
1. A design must have an image URL and a valid category.
2. Only the primary administrator (`godwinthompson067@gmail.com`) can create, delete, or perform full updates on designs.
3. Viewers can increment `likes` or `views` only.
4. Reviews must be associated with a valid design.
5. Inquiries are append-only for viewers and readable only by the admin.

## The Dirty Dozen Payloads (Rejection Targets)

1. **Anonymous Design Creation**: Attempting to create a design without being logged in as admin.
2. **Identity Spoofing**: Attempting to upload a design with a different `authorId`.
3. **Likes Inflation**: Attempting to update `likes` by more than +1 at a time (though Firestore rules can't easily check the delta without `getAfter`, we check `affectedKeys`).
4. **Metadata Overwrite**: A viewer attempting to change the `imageUrl` or `category` of an existing design.
5. **System Field Injection**: Attempting to inject a `verified: true` field into a review.
6. **Malicious ID**: Attempting to use a 2KB string as a document ID.
7. **Cross-Design Review**: Attempting to post a review with a `designId` mismatch (enforced by sub-collection path).
8. **PII Harvesting**: An anonymous user attempting to list all `inquiries`.
9. **Review Sabotage**: A viewer attempting to delete someone else's review.
10. **Admin Privilege Escalation**: A user attempting to set their own status to `isAdmin: true` in a hypothetical users collection.
11. **Negative Counters**: Setting `likes` to -1.
12. **Orphaned Writes**: Creating a review for a non-existent design.

## Test Strategy
- Use `firestore-test-sdk` equivalents to verify these denials.
- Enforce strict `affectedKeys` for partial updates (`likes`, `views`).
