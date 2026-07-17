export type Department = 'Computer' | 'Electronics' | 'Electrical' | 'Civil' | 'Mechanical' | 'Refrigeration & Air Conditioning' | 'Environmental';
export type Semester = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th';
export type Shift = '1st' | '2nd';
export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Rocket';
export type PaymentStatus = 'Verified' | 'Pending';

export interface Contribution {
  id?: string;
  fullName: string;
  rollNumber: string;
  registrationNumber?: string;
  department: Department;
  semester: Semester;
  shift: Shift;
  mobileNumber: string;
  email?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paymentScreenshot?: string;
  academicSession: string;
  submissionId: string;
  createdAt: string;
  metadata: {
    ip?: string;
    device: string;
    browser: string;
  };
}

export interface FarewellStudent {
  id?: string;
  fullName: string;
  rollNumber: string;
  registrationNumber?: string;
  department: Department;
  semester: Semester;
  shift: Shift;
  academicSession: string;
  mobileNumber: string;
  email?: string;
  willAttend: 'Yes' | 'No';
  remarks?: string;
  submissionId: string;
  createdAt: string;
  metadata: {
    ip?: string;
    device: string;
    browser: string;
  };
}

export type Language = 'bn' | 'en';

export interface AdminStats {
  total: number;
  paid: number;
  pending: number;
  totalAmount: number;
  byDepartment: Record<string, number>;
  bySemester: Record<string, number>;
  recentActivity: Contribution[];
  farewellStats?: {
    total: number;
    attending: number;
    notAttending: number;
    byDepartment: Record<string, number>;
    bySemester: Record<string, number>;
  };
}
