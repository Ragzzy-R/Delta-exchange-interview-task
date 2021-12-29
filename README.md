# Delta Exchange Interview task
## technology used
- React
- Typescript

## Developer notes
- Used an alternative socket URL from documentation as the URL in the question document no longer resolves.
- There were times when the socket pumps out lot of data which is causing react to re-render too many times. So as a quick optimization, the table is updated in batches. When socket sends a data, it is added to a batch and the product table is only updated when the batch hits `MAX_BATCH_SIZE_BEFORE_FLUSH`
- Some Socket Controller code were intentionally added to the `App` component instead of keeping theme seperate inside the `SocketController`. The reason is, outsourcing handlers out to controller causes stale states. The ideal solution is to use a store like Redux but I don't wanted to complicate things. So added them directly on app for the time being.
- The table is sorted by `mark_price` at all times.
- The mark price field is not updated unless socket sends the symbol's data. So you can see the rows slowly updating the data over time. If the value is never sent, the field just shows loading animation. i can't set them to 0 because I assume 0 is a valid value and cannot be used for NA.
- Finally I've done all the requirement except the first column to be made sticky. I tried my best but it didn't work.
- I wanted to add some minimal unit tests but unfortunately, I didn't had much time. I can add tests if you want them.
