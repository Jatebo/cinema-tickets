import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (typeof accountId !== 'number' || accountId <= 0) {
      throw new InvalidPurchaseException(
        'accountId must be an integer greater than 0'
      );
    }

    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('No ticket requests received');
    }

    const requests = { adult: 0, child: 0, infant: 0 };

    ticketTypeRequests.forEach((request) => {
      const type = request.getTicketType().toLowerCase();
      const value = request.getNoOfTickets();
      requests[type] = value;
    });

    if (requests.adult + requests.child + requests.infant === 0) {
      throw new InvalidPurchaseException(
        'At least one ticket must be requested'
      );
    }

    if (requests.adult === 0 && (requests.child > 0 || requests.infant > 0)) {
      throw new InvalidPurchaseException(
        'Infants/Children must be accompanied by an adult'
      );
    }

    if (requests.adult < requests.infant) {
      throw new InvalidPurchaseException(
        'There must be no more than one infant per adult'
      );
    }

    if (requests.adult + requests.child + requests.infant > 20) {
      throw new InvalidPurchaseException(
        'A maximum of 20 tickets can be bought at a time'
      );
    }
    const totalCharges = this.#calculateTicketCharges(requests);
    const totalSeats = this.#calculateTotalSeats(requests);

    new TicketPaymentService().makePayment(accountId, totalCharges);
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
