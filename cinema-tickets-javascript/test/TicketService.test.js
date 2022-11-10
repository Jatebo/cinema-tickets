import TicketService from '../src/pairtest/TicketService';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException';

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
      let expectedTotalCost = 100;
      ticketService.purchaseTickets(
        accountId,
        adultTicketRequest,
        childTicketRequest,
        infantTicketRequest
      );
      expect(paymentSpy).toHaveBeenCalledWith(1, expectedTotalCost);

      adultTicketRequest = new TicketTypeRequest('ADULT', 5);
      childTicketRequest = new TicketTypeRequest('CHILD', 4);
      infantTicketRequest = new TicketTypeRequest('INFANT', 2);

      ticketService.purchaseTickets(
        accountId,
        adultTicketRequest,
        childTicketRequest,
        infantTicketRequest
      );

      expectedTotalCost = 140;
      expect(paymentSpy).toHaveBeenLastCalledWith(1, expectedTotalCost);
      expect(paymentSpy).toHaveBeenCalledTimes(2);
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
      let expectedSeats = 7;
      expect(seatResSpy).toHaveBeenCalledWith(1, expectedSeats);

      adultTicketRequest = new TicketTypeRequest('ADULT', 5);
      childTicketRequest = new TicketTypeRequest('CHILD', 4);
      infantTicketRequest = new TicketTypeRequest('INFANT', 2);

      ticketService.purchaseTickets(
        accountId,
        adultTicketRequest,
        childTicketRequest,
        infantTicketRequest
      );

      expectedSeats = 9;
      expect(seatResSpy).toHaveBeenLastCalledWith(1, expectedSeats);
      expect(seatResSpy).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Error Handling', () => {
  let adultTicketRequest;
  let childTicketRequest;
  let infantTicketRequest;
  let ticketService;
  let accountId;
  let paymentSpy;
  let seatResSpy;
  let purchaseTicketsSpy;

  beforeEach(() => {
    adultTicketRequest = new TicketTypeRequest('ADULT', 3);
    childTicketRequest = new TicketTypeRequest('CHILD', 4);
    infantTicketRequest = new TicketTypeRequest('INFANT', 2);
    accountId = 1;
    ticketService = new TicketService();
    paymentSpy = jest.spyOn(TicketPaymentService.prototype, 'makePayment');
    seatResSpy = jest.spyOn(SeatReservationService.prototype, 'reserveSeat');
    purchaseTicketsSpy = jest.spyOn(TicketService.prototype, 'purchaseTickets');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('InvalidPurchaseException', () => {
    it('should throw an error when the account number provided is not a number greater than 0', () => {
      accountId = '1';

      expect(() => {
        ticketService.purchaseTickets(
          accountId,
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('accountId must be an integer greater than 0');

      accountId = new TicketTypeRequest('ADULT', 1);

      expect(() => {
        ticketService.purchaseTickets(
          accountId,
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('accountId must be an integer greater than 0');

      expect(() => {
        ticketService.purchaseTickets(
          [],
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('accountId must be an integer greater than 0');
      expect(() => {
        ticketService.purchaseTickets(
          -1,
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('accountId must be an integer greater than 0');
      expect(() => {
        ticketService.purchaseTickets(
          null,
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('accountId must be an integer greater than 0');

      expect(() => {
        ticketService.purchaseTickets(
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('accountId must be an integer greater than 0');
      expect(seatResSpy).toHaveBeenCalledTimes(0);
      expect(paymentSpy).toHaveBeenCalledTimes(0);
      expect(purchaseTicketsSpy).toHaveBeenCalledTimes(6);
    });
    it('should throw an error when children/infant tickets are ordered without an adult', () => {
      expect(() => {
        ticketService.purchaseTickets(
          accountId,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('Infants/Children must be accompanied by an adult');
      expect(seatResSpy).toHaveBeenCalledTimes(0);
      expect(paymentSpy).toHaveBeenCalledTimes(0);
      expect(purchaseTicketsSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when the number of infants exceeds the number of adults', () => {
      adultTicketRequest = new TicketTypeRequest('ADULT', 1);

      expect(() => {
        ticketService.purchaseTickets(
          accountId,
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('There must be no more than one infant per adult');
      expect(seatResSpy).toHaveBeenCalledTimes(0);
      expect(paymentSpy).toHaveBeenCalledTimes(0);
      expect(purchaseTicketsSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the number of ticket requests is greater than 20', () => {
      adultTicketRequest = new TicketTypeRequest('ADULT', 20);

      expect(() => {
        ticketService.purchaseTickets(
          accountId,
          adultTicketRequest,
          childTicketRequest,
          infantTicketRequest
        );
      }).toThrow('A maximum of 20 tickets can be bought at a time');
      expect(seatResSpy).toHaveBeenCalledTimes(0);
      expect(paymentSpy).toHaveBeenCalledTimes(0);

      adultTicketRequest = new TicketTypeRequest('ADULT', 20);

      ticketService.purchaseTickets(accountId, adultTicketRequest);
      expect(seatResSpy).toHaveBeenCalledTimes(1);
      expect(paymentSpy).toHaveBeenCalledTimes(1);
      expect(purchaseTicketsSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if no tickets are requested', () => {
      adultTicketRequest = new TicketTypeRequest('ADULT', 20);
      expect(() => {
        ticketService.purchaseTickets(accountId);
      }).toThrow('No ticket requests received');

      expect(seatResSpy).toHaveBeenCalledTimes(0);
      expect(paymentSpy).toHaveBeenCalledTimes(0);

      adultTicketRequest = new TicketTypeRequest('ADULT', 0);

      expect(() => {
        ticketService.purchaseTickets(accountId, adultTicketRequest);
      }).toThrow('At least one ticket must be requested');
      expect(seatResSpy).toHaveBeenCalledTimes(0);
      expect(paymentSpy).toHaveBeenCalledTimes(0);
      expect(purchaseTicketsSpy).toHaveBeenCalledTimes(2);
    });
  });
});
