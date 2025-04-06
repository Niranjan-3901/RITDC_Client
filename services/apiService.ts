import { addDays, addMonths, format } from "date-fns";
import { apiRequest } from "./genericApiHandler";

// Dashboard stats
export const getStats = async () => {
  // This is a mock response for demo purposes
  // In a real application, you would use:
  // return await apiRequest('/dashboard/stats');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalStudents: 1250,
        newAdmissions: 42,
        feesCollected: 1250000,
        pendingFees: 350000,
        attendanceToday: 85,
        recentActivities: [
          {
            id: 1,
            type: "admission",
            title: "New Admission",
            description: "Rahul Sharma admitted to Class XI Science",
            time: "2 hours ago",
          },
          {
            id: 2,
            type: "payment",
            title: "Fee Payment",
            description: "Received ₹45,000 from Priya Patel",
            time: "3 hours ago",
          },
          {
            id: 3,
            type: "result",
            title: "Results Published",
            description: "Term 1 results published for Class X",
            time: "5 hours ago",
          },
          {
            id: 4,
            type: "attendance",
            title: "Attendance Updated",
            description: "Today's attendance recorded for all classes",
            time: "6 hours ago",
          },
        ],
      });
    }, 1000);
  });
};

export const loginUser = async (body: any) => {
  return await apiRequest("/auth/login", "POST", body);
};

export const registerUser = async (body: any) => {
  return await apiRequest("/auth/register", "POST", body);
};
// Students Module
export const getStudents = async (
  page: number = 1,
  limit: number = 20,
  classFilter: string = "",
  sectionFilter: string = ""
) => {
  let url = `/students/get?page=${page}&limit=${limit}`;
  if (classFilter) {
    url += `&classFilter=${classFilter}`;
  }
  if (sectionFilter) {
    url += `&sectionFilter=${sectionFilter}`;
  }
  return await apiRequest(url, "GET");
};

export const getStudentDetailsById = async (id: string) => {
  return await apiRequest(`/students/${id}`, "GET");
};

export const createStudent = async (studentData: any) => {
  return await apiRequest("/students/create", "POST", studentData);
};

export const updateStudent = async (id: string, studentData: any) => {
  return await apiRequest(`/students/update/${id}`, "POST", studentData[0]);
};

export const deleteStudent = async (id: string) => {
  return await apiRequest(`/students/delete/${id}`, "DELETE");
};

export const importStudents = async (fileData: any) => {
  return await apiRequest("/students/import", "POST", fileData);
};

export const exportStudents = async (filters = {}) => {
  return await apiRequest("/students/export", "POST", filters);
};

// Admissions Module
export const getAdmissions = async (
  page: number = 1,
  limit: number = 20,
  filters = {}
) => {
  return await apiRequest(`/admissions?page=${page}&limit=${limit}`, "GET");
};

export const processAdmission = async (admissionData: any) => {
  return await apiRequest("/admissions", "POST", admissionData);
};

export const recordFeePayment = async (paymentData: any) => {
  return await apiRequest("/fees/payments", "POST", paymentData);
};

// Attendance Module
export const getAttendance = async (date: string, classId?: string) => {
  const endpoint = classId
    ? `/attendance?date=${date}&classId=${classId}`
    : `/attendance?date=${date}`;
  return await apiRequest(endpoint);
};

export const markAttendance = async (attendanceData: any) => {
  return await apiRequest("/attendance", "POST", attendanceData);
};

export const getAttendanceReports = async (filters: any) => {
  return await apiRequest("/attendance/reports", "POST", filters);
};

// Results Module
export const getResults = async (examId: string, classId?: string) => {
  const endpoint = classId
    ? `/results?examId=${examId}&classId=${classId}`
    : `/results?examId=${examId}`;
  return await apiRequest(endpoint);
};

export const uploadResults = async (resultsData: any) => {
  return await apiRequest("/results", "POST", resultsData);
};

export const generateReportCards = async (examId: string, classId?: string) => {
  const endpoint = classId
    ? `/results/report-cards?examId=${examId}&classId=${classId}`
    : `/results/report-cards?examId=${examId}`;
  return await apiRequest(endpoint, "POST");
};

// Reports Module
export const generateReport = async (reportType: string, filters: any) => {
  return await apiRequest(`/reports/${reportType}`, "POST", filters);
};

export const fetchClassFromDB = async () => {
  return await apiRequest("/class/get", "GET");
};

export const fetchSectionFromDB = async () => {
  return await apiRequest("/class/sections/get-all-sections", "GET");
};

export const fetchAllClassAndSections = async () => {
  return await apiRequest("/class/getClassAndSections", "GET");
};

export const createClass = async (Class: String) => {
  return await apiRequest("/class/create", "POST", {name: Class, sections: []});
}

export const addSectionInAClass = async (ClassId: String,sections: Array<String>)=>{
  return await apiRequest(`/class/add-section/${ClassId}`, "POST", sections)
}

export const deleteClass = async (ClassId: String)=>{
  return await apiRequest(`/class/delete/${ClassId}`, "DELETE")
}

export const deleteSection = async (SectionId: String)=>{
  return await apiRequest(`/class/sections/delete/${SectionId}`,"DELETE")
}

export const updateSection = async (SectionId: String, updatedSection: Object) =>{
  return await apiRequest(`/class/sections/updateSectionName/${SectionId}`,"POST", updatedSection)
}

export const updateClass = async (ClassId: String, updatedClass: Object) => {
  return await apiRequest(`/class/update/${ClassId}`,"POST", updatedClass)
}


// --------------------------------------------------------------------------

// Interfaces for the fee structure
export interface FeeRecord {
  _id?: string;
  student: {
    _id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
  };
  serialNumber: string;
  feeAmount: number;
  status: "paid" | "unpaid" | "partial" | "overdue";
  nextPaymentDate: string;
  dueDate: string;
  payments: Payment[];
  notes: FeeNote[];
  academicYear: string;
  term: string;
}

export interface Payment {
  date: string;
  amount: number;
  method: string;
  reference?: string;
}

export interface FeeNote {
  date: string;
  text: string;
}

export type FilterType = "all" | "paid" | "unpaid" | "partial" | "overdue";

// Fee Module API functions
export const fetchFeeRecords = async (
  page: number = 1,
  limit: number = 20,
  classFilter: string = "",
  sectionFilter: string = ""
) => {
  let url = `/fees?page=${page}&limit=${limit}`
  if (classFilter) {
    url += `&classFilter=${classFilter}`;
  }
  if (sectionFilter) {
    url += `&sectionFilter=${sectionFilter}`;
  }
  return await apiRequest(url, "GET");
};

export const fetchFeeRecordsByStatus = async (status: FilterType, page:number, limit:number) => {
  if (status === "all") {
    return await apiRequest(`/fees?page=${page}&limit=${limit}`, "GET");
  }
  return await apiRequest(`/fees/filter/${status}?page=${page}&limit=${limit}`, "GET");
};

export const fetchStudentFeeRecords = async (studentId: string) => {
  return await apiRequest(`/fees/student/${studentId}`, "GET");
};

export const createFeeRecord = async (feeRecord: Object, studentId: String) => {
  return await apiRequest("/fees", "POST", {feeRecord, studentId});
};

export const addPayment = async (feeRecordId: string, payment: Payment) => {
  return await apiRequest(`/fees/${feeRecordId}/payments`, "POST", payment);
};

export const addNote = async (feeRecordId: string, note: FeeNote) => {
  return await apiRequest(`/fees/${feeRecordId}/notes`, "POST", note);
};

export const importFeeRecordsFromExcel = async (data: any[]) => {
  const processedRecords = data.map((row, index) => {
    let admissionDate;
    try {
      if (typeof row["Admission Date"] === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        admissionDate = new Date(
          excelEpoch.getTime() + row["Admission Date"] * millisecondsPerDay
        );
      } else {
        const [month, day, year] = (row["Admission Date"] || "").split("/");
        admissionDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
      }

      // Validate the date
      if (isNaN(admissionDate.getTime())) {
        throw new Error(`Invalid date for record at row ${index + 1}`);
      }

      const nextPaymentDate = addMonths(admissionDate, 1);
      const dueDate = addDays(nextPaymentDate, 15);

      const fullName = row["Student Name"].trim(); // Ensure no leading/trailing spaces
      const nameParts = fullName.split(/\s+/); // Split by one or more whitespace characters

      let firstName = "";
      let lastName = "";

      if (nameParts.length > 0) {
        firstName = nameParts[0]; // The first element is the first name
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(" "); // Join the remaining parts as the last name
        }
      }

      return {
        admissionNumber: row["Roll Number"]?.toString() || `ADM${index + 1}`,
        serialNumber: row["Serial Number"]?.toString() || `SN${index + 1}`,
        feeAmount: 10000,
        firstName: firstName,
        lastName: lastName,
        status: "unpaid",
        admissionDate: format(admissionDate, 'yyyy-MM-dd'),
        nextPaymentDate: format(nextPaymentDate, "yyyy-MM-dd"),
        dueDate: format(dueDate, "yyyy-MM-dd"),
        academicYear: new Date().getFullYear().toString(),
        term: "Annual",
      };
    } catch (error: any) {
      console.error(`Error processing row ${index + 1}:`, error);
      throw new Error(
        `Failed to process record at row ${index + 1}: ${error.message}`
      );
    }
  });


  return await apiRequest("/fees/import", "POST", processedRecords);
};

export const getClassFeeReport = async (
  classId: string,
  academicYear: string
) => {
  return await apiRequest(
    `/fees/report/class/${classId}/${academicYear}`,
    "GET"
  );
};

// Additional functions to match the pattern in your existing code
export const getFeeStructure = async () => {
  return await apiRequest("/fees/structure", "GET");
};

export const updateFeeStructure = async (structureData: any) => {
  return await apiRequest("/fees/structure", "PUT", structureData);
};

export const generateFeeReceipt = async (paymentId: string) => {
  return await apiRequest(`/fees/payments/${paymentId}/receipt`, "GET");
};

export const getFees = async (
  page: number = 1,
  limit: number = 20,
  filters = {}
) => {
  return await apiRequest(`/fees?page=${page}&limit=${limit}`, "GET");
};
