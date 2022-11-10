import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    const requests = { adult: 0, child: 0, infant: 0 };

    ticketTypeRequests.forEach((request) => {
      const type = request.getTicketType().toLowerCase();
      const value = request.getNoOfTickets();
      requests[type] = value;
    });

    const totalCharges = this.#calculateTicketCharges(requests);
    new TicketPaymentService().makePayment(accountId, totalCharges);

    const totalSeats = this.#calculateTotalSeats(requests);
    new SeatReservationService().reserveSeat(accountId, totalSeats);
  }

  #calculateTicketCharges(requests) {
    const { adult, child } = requests;
    return adult * 20 + child * 10;
  }

  #calculateTotalSeats(requests) {
    const { adult, child } = requests;
    return adult + child;
  }
}

// Error handling to cover:

// Greater than 20 tickets being requested
// child/infant without adult
// more infants than adults (infants must sit on adult lap)
// ID number is not a number or less than 1
