import TicketService from '../src/pairtest/TicketService';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService';

import { jest } from '@jest/globals';

describe('TicketService', () => {
  describe('purchaseTickets', () => {
    let adultTicketRequest;
    let childTicketRequest;
    let infantTicketRequest;
    let ticketService;
    let accountId;
    let paymentSpy;
    let seatResSpy;

    beforeEach(() => {
      adultTicketRequest = new TicketTypeRequest('ADULT', 3);
      childTicketRequest = new TicketTypeRequest('CHILD', 4);
      infantTicketRequest = new TicketTypeRequest('INFANT', 2);
      accountId = 1;
      ticketService = new TicketService();
      paymentSpy = jest.spyOn(TicketPaymentService.prototype, 'makePayment');
      seatResSpy = jest.spyOn(SeatReservationService.prototype, 'reserveSeat');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should make a call to the ticket payment service', () => {
      ticketService.purchaseTickets(
        accountId,
        adultTicketRequest,
        childTicketRequest,
        infantTicketRequest
      );

      expect(paymentSpy).toHaveBeenCalled();
    });
    it('Should calculate the correct total ticket cost', () => {
      const expectedTotalCost = 100;
      ticketService.purchaseTickets(
        accountId,
        adultTicketRequest,
        childTicketRequest,
        infantTicketRequest
      );
      expect(paymentSpy).toHaveBeenCalledWith(1, expectedTotalCost);
    });
    it('should make a call to the seat reservation service', () => {
      ticketService.purchaseTickets(
        accountId,
        adultTicketRequest,
        childTicketRequest,
        infantTicketRequest
      );
      expect(seatResSpy).toHaveBeenCalled();
    });
    it('should request the correct amount of seats to be reserved', () => {
      ticketService.purchaseTickets(
        accountId,
        adultTicketRequest,
        childTicketRequest,
        infantTicketRequest
      );
      const expectedSeats = 7;
      expect(seatResSpy).toHaveBeenCalledWith(1, expectedSeats);
    });
  });
});
