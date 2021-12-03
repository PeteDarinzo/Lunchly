/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this._numGuests = numGuests;
    this.startAt = startAt;
    this._notes = notes;
  }

  /** Reservation guest number getter and setter. */

  get numGuests() {
    return this._numGuests;
  }

  set numGuests(num) {
    if(num < 1) {
      const err = new Error("Reservation must be at least one person.");
      err.status = 400;
      throw err;
    } else {
      this._numGuests = num;
    }
  }


  /** Reservation notes getter and setter. */

  get notes() {
    return this._notes;
  }

  set notes(val) {
    if(!val) {
      this._notes="";
    } else {
      this._notes= val;
    }
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) { // if a new reservation is being created
      const result = await db.query(`INSERT INTO reservations (customer_id, start_at, num_guests, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET customer_id=$1, start_at=$2, num_guests=$3, notes=$4
        WHERE id=$5`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
    }
  }


}


module.exports = Reservation;