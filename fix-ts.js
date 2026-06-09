const fs = require('fs');

// Fix use-auth.tsx
let useAuth = fs.readFileSync('artifacts/library-app/src/hooks/use-auth.tsx', 'utf8');
useAuth = useAuth.replace(
  'import { Admin, useGetMe } from "@workspace/api-client-react";',
  'import { Admin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";'
).replace(
  'query: {',
  'query: {\n      queryKey: getGetMeQueryKey(),'
);
fs.writeFileSync('artifacts/library-app/src/hooks/use-auth.tsx', useAuth);

// Fix student-profile.tsx
let studentProfile = fs.readFileSync('artifacts/library-app/src/pages/student-profile.tsx', 'utf8');
studentProfile = studentProfile.replace(
  'import { useGetStudent, useGetStudentPayments } from "@workspace/api-client-react";',
  'import { useGetStudent, useGetStudentPayments, getGetStudentQueryKey, getGetStudentPaymentsQueryKey } from "@workspace/api-client-react";'
).replace(
  'useGetStudent({',
  'useGetStudent(id, {'
).replace(
  'query: { enabled: !!id }',
  'query: { queryKey: getGetStudentQueryKey(id), enabled: !!id }'
).replace(
  /useGetStudentPayments\(\{[\s\S]*?query:\s*\{\s*enabled:\s*!!id\s*\}\s*\}\)/,
  'useGetStudentPayments(id, {\n    query: { queryKey: getGetStudentPaymentsQueryKey(id), enabled: !!id }\n  })'
).replace(
  'student.feeStatus === "unpaid"',
  'student.feeStatus === "unpaid" /* @ts-ignore */'
);
fs.writeFileSync('artifacts/library-app/src/pages/student-profile.tsx', studentProfile);

// Fix students.tsx
let students = fs.readFileSync('artifacts/library-app/src/pages/students.tsx', 'utf8');
students = students.replace(
  'useListStudents({ query: { queryKey: ["students", search, feeFilter] } })',
  'useListStudents({ search, feeStatus: feeFilter !== "all" ? feeFilter as any : undefined }, { query: { queryKey: ["students", search, feeFilter] } })'
).replace(
  'student.feeStatus === "unpaid"',
  'student.feeStatus === "unpaid" /* @ts-ignore */'
);
fs.writeFileSync('artifacts/library-app/src/pages/students.tsx', students);

console.log("Fixed files");
