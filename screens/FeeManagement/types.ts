// export interface Student {
//   id: string;
//   serialNumber: string;
//   admissionNumber: string;
//   name: string;
//   admissionDate: string;
//   feeAmount: number;
//   status: 'paid' | 'unpaid' | 'partial' | 'overdue';
//   nextPaymentDate: string;
//   dueDate: string;
//   payments: Payment[];
//   notes: StudentNote[];
// }

// export interface Payment {
// //   id: string;
//   date: string;
//   amount: number;
//   method: string;
//   reference?: string;
// }

// export interface StudentNote {
// //   id: string;
//   date: string;
//   text: string;
// }

// export type FilterType = 'all' | 'paid' | 'unpaid' | 'partial' | 'overdue';

export interface Student {
  _id?: string;
  student: {
    _id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
  };
  serialNumber: string;
  feeAmount: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
  nextPaymentDate: string;
  dueDate: string;
  payments: Payment[];
  notes: StudentNote[];
  academicYear: string;
  term: string;
  admissionDate: string;
}

export interface Payment {
  _id?: string;
  date: string;
  amount: number;
  method: string;
  reference?: string;
  createdAt?: string;
}

export interface StudentNote {
  _id?: string;
  date: string;
  text: string;
  createdBy?: {
    _id: string;
    name: string;
  };
}

export type FilterType = 'all' | 'paid' | 'unpaid' | 'partial' | 'overdue';