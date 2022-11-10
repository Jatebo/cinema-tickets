Install dependencies with npm install

Tests run with command 'npm test'

TicketService consists of one public and two private methods (purchaseTickets, #calculateTicketCharges and #calculateTotalSeats)

Provided the appropriate criteria are fulfilled, the private methods will calculate the number of seats and total ticket charges to be made, before making the relevant requests with the third party services.

Exceptions are thrown if:

Tickets (not seats) exceed 20
No Adult tickets are purchased when attempting to purchase child/infant tickets
Account Number is not a positive integer
No ticket requests are sent or the ticketTypeRequests array is empty
The total number of tickets requested in the ticket requests is 0
Not enough Adult tickets are requested for the amount of infants that require a lap to be seated on
