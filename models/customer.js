/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this._notes = notes;
    this._fullName = `${firstName} ${lastName}`;
  }

  /** fullName getter */

  get fullName() {
    return this._fullName
  }

  /** Customer notes getter and setter. */

  get notes() {
    return this._notes;
  }

  set notes(val) {
    if (!val) {
      this._notes = "";
    } else {
      this._notes = val;
    }
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** Get a customer by name */

  static async search(name) {
    const firstAndLast = name.split(' ');
    const firstName = firstAndLast[0];
    const lastName = firstAndLast[1];

    const result = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers
        WHERE first_name=$1 AND last_name=$2`,
      [firstName, lastName])

    const customer = result.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${name}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** Get the 10 best customers. */

  static async best() {
    const results = await db.query(
      `SELECT c.id, first_name AS "firstName",  last_name AS "lastName", phone, c.notes
        FROM customers AS c JOIN reservations as r
        ON c.id = r.customer_id
        GROUP BY c.id, c.first_name, c.last_name
        ORDER BY  COUNT(customer_id) DESC
        LIMIT 10`
    );
    return results.rows.map(c => new Customer(c));
  }


  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this._notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this._notes, this.id]
      );
    }
  }

  // async fullName() {
  //   const results = await db.query(`SELECT first_name, last_name FROM customers WHERE id=$1`, [this.id]);
  //   const { first_name, last_name } = results.rows[0];
  //   const fullName = `${first_name} ${last_name}`;
  //   return fullName;
  // }

}

module.exports = Customer;
