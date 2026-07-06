import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";
const getHealthCheckUrl = () => {
  return `/api/healthz`;
};
const healthCheck = async (options) => {
  return customFetch(
    getHealthCheckUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getHealthCheckQueryKey = () => {
  return [
    `/api/healthz`
  ];
};
const getHealthCheckQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn = ({ signal }) => healthCheck({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useHealthCheck(options) {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getAdminLoginUrl = () => {
  return `/api/auth/login`;
};
const adminLogin = async (loginInput, options) => {
  return customFetch(
    getAdminLoginUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        loginInput
      )
    }
  );
};
const getAdminLoginMutationOptions = (options) => {
  const mutationKey = ["adminLogin"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return adminLogin(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useAdminLogin = (options) => {
  return useMutation(getAdminLoginMutationOptions(options));
};
const getChangePasswordUrl = () => {
  return `/api/auth/change-password`;
};
const changePassword = async (changePasswordInput, options) => {
  return customFetch(
    getChangePasswordUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        changePasswordInput
      )
    }
  );
};
const getChangePasswordMutationOptions = (options) => {
  const mutationKey = ["changePassword"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return changePassword(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useChangePassword = (options) => {
  return useMutation(getChangePasswordMutationOptions(options));
};
const getForgotPasswordUrl = () => {
  return `/api/auth/forgot-password`;
};
const forgotPassword = async (forgotPasswordInput, options) => {
  return customFetch(
    getForgotPasswordUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        forgotPasswordInput
      )
    }
  );
};
const getForgotPasswordMutationOptions = (options) => {
  const mutationKey = ["forgotPassword"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return forgotPassword(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useForgotPassword = (options) => {
  return useMutation(getForgotPasswordMutationOptions(options));
};
const getGetMeUrl = () => {
  return `/api/auth/me`;
};
const getMe = async (options) => {
  return customFetch(
    getGetMeUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetMeQueryKey = () => {
  return [
    `/api/auth/me`
  ];
};
const getGetMeQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetMeQueryKey();
  const queryFn = ({ signal }) => getMe({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetMe(options) {
  const queryOptions = getGetMeQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetLibraryConfigUrl = () => {
  return `/api/library`;
};
const getLibraryConfig = async (options) => {
  return customFetch(
    getGetLibraryConfigUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetLibraryConfigQueryKey = () => {
  return [
    `/api/library`
  ];
};
const getGetLibraryConfigQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetLibraryConfigQueryKey();
  const queryFn = ({ signal }) => getLibraryConfig({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetLibraryConfig(options) {
  const queryOptions = getGetLibraryConfigQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getUpdateLibraryConfigUrl = () => {
  return `/api/library`;
};
const updateLibraryConfig = async (libraryConfigInput, options) => {
  return customFetch(
    getUpdateLibraryConfigUrl(),
    {
      ...options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        libraryConfigInput
      )
    }
  );
};
const getUpdateLibraryConfigMutationOptions = (options) => {
  const mutationKey = ["updateLibraryConfig"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return updateLibraryConfig(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useUpdateLibraryConfig = (options) => {
  return useMutation(getUpdateLibraryConfigMutationOptions(options));
};
const getGetPublicLibraryUrl = (id) => {
  return `/api/public/libraries/${id}`;
};
const getPublicLibrary = async (id, options) => {
  return customFetch(
    getGetPublicLibraryUrl(id),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetPublicLibraryQueryKey = (id) => {
  return [
    `/api/public/libraries/${id}`
  ];
};
const getGetPublicLibraryQueryOptions = (id, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetPublicLibraryQueryKey(id);
  const queryFn = ({ signal }) => getPublicLibrary(id, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: !!id, ...queryOptions };
};
function useGetPublicLibrary(id, options) {
  const queryOptions = getGetPublicLibraryQueryOptions(id, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetDashboardStatsUrl = () => {
  return `/api/dashboard/stats`;
};
const getDashboardStats = async (options) => {
  return customFetch(
    getGetDashboardStatsUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetDashboardStatsQueryKey = () => {
  return [
    `/api/dashboard/stats`
  ];
};
const getGetDashboardStatsQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetDashboardStatsQueryKey();
  const queryFn = ({ signal }) => getDashboardStats({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetDashboardStats(options) {
  const queryOptions = getGetDashboardStatsQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetRevenueAnalyticsUrl = () => {
  return `/api/dashboard/revenue`;
};
const getRevenueAnalytics = async (options) => {
  return customFetch(
    getGetRevenueAnalyticsUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetRevenueAnalyticsQueryKey = () => {
  return [
    `/api/dashboard/revenue`
  ];
};
const getGetRevenueAnalyticsQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetRevenueAnalyticsQueryKey();
  const queryFn = ({ signal }) => getRevenueAnalytics({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetRevenueAnalytics(options) {
  const queryOptions = getGetRevenueAnalyticsQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetOccupancyAnalyticsUrl = () => {
  return `/api/dashboard/occupancy`;
};
const getOccupancyAnalytics = async (options) => {
  return customFetch(
    getGetOccupancyAnalyticsUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetOccupancyAnalyticsQueryKey = () => {
  return [
    `/api/dashboard/occupancy`
  ];
};
const getGetOccupancyAnalyticsQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetOccupancyAnalyticsQueryKey();
  const queryFn = ({ signal }) => getOccupancyAnalytics({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetOccupancyAnalytics(options) {
  const queryOptions = getGetOccupancyAnalyticsQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetRecentPaymentsUrl = () => {
  return `/api/dashboard/recent-payments`;
};
const getRecentPayments = async (options) => {
  return customFetch(
    getGetRecentPaymentsUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetRecentPaymentsQueryKey = () => {
  return [
    `/api/dashboard/recent-payments`
  ];
};
const getGetRecentPaymentsQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetRecentPaymentsQueryKey();
  const queryFn = ({ signal }) => getRecentPayments({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetRecentPayments(options) {
  const queryOptions = getGetRecentPaymentsQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetDuesTodayUrl = () => {
  return `/api/dashboard/dues-today`;
};
const getDuesToday = async (options) => {
  return customFetch(
    getGetDuesTodayUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetDuesTodayQueryKey = () => {
  return [
    `/api/dashboard/dues-today`
  ];
};
const getGetDuesTodayQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetDuesTodayQueryKey();
  const queryFn = ({ signal }) => getDuesToday({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetDuesToday(options) {
  const queryOptions = getGetDuesTodayQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetOverdueStudentsUrl = () => {
  return `/api/dashboard/overdue`;
};
const getOverdueStudents = async (options) => {
  return customFetch(
    getGetOverdueStudentsUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetOverdueStudentsQueryKey = () => {
  return [
    `/api/dashboard/overdue`
  ];
};
const getGetOverdueStudentsQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetOverdueStudentsQueryKey();
  const queryFn = ({ signal }) => getOverdueStudents({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetOverdueStudents(options) {
  const queryOptions = getGetOverdueStudentsQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getListStudentsUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== void 0) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0 ? `/api/students?${stringifiedParams}` : `/api/students`;
};
const listStudents = async (params, options) => {
  return customFetch(
    getListStudentsUrl(params),
    {
      ...options,
      method: "GET"
    }
  );
};
const getListStudentsQueryKey = (params) => {
  return [
    `/api/students`,
    ...params ? [params] : []
  ];
};
const getListStudentsQueryOptions = (params, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListStudentsQueryKey(params);
  const queryFn = ({ signal }) => listStudents(params, { signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useListStudents(params, options) {
  const queryOptions = getListStudentsQueryOptions(params, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getCreateStudentUrl = () => {
  return `/api/students`;
};
const createStudent = async (studentInput, options) => {
  return customFetch(
    getCreateStudentUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        studentInput
      )
    }
  );
};
const getCreateStudentMutationOptions = (options) => {
  const mutationKey = ["createStudent"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return createStudent(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useCreateStudent = (options) => {
  return useMutation(getCreateStudentMutationOptions(options));
};
const getGetStudentUrl = (id) => {
  return `/api/students/${id}`;
};
const getStudent = async (id, options) => {
  return customFetch(
    getGetStudentUrl(id),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetStudentQueryKey = (id) => {
  return [
    `/api/students/${id}`
  ];
};
const getGetStudentQueryOptions = (id, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetStudentQueryKey(id);
  const queryFn = ({ signal }) => getStudent(id, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: !!id, ...queryOptions };
};
function useGetStudent(id, options) {
  const queryOptions = getGetStudentQueryOptions(id, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getUpdateStudentUrl = (id) => {
  return `/api/students/${id}`;
};
const updateStudent = async (id, studentUpdate, options) => {
  return customFetch(
    getUpdateStudentUrl(id),
    {
      ...options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        studentUpdate
      )
    }
  );
};
const getUpdateStudentMutationOptions = (options) => {
  const mutationKey = ["updateStudent"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id, data } = props ?? {};
    return updateStudent(id, data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useUpdateStudent = (options) => {
  return useMutation(getUpdateStudentMutationOptions(options));
};
const getDeleteStudentUrl = (id) => {
  return `/api/students/${id}`;
};
const deleteStudent = async (id, options) => {
  return customFetch(
    getDeleteStudentUrl(id),
    {
      ...options,
      method: "DELETE"
    }
  );
};
const getDeleteStudentMutationOptions = (options) => {
  const mutationKey = ["deleteStudent"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id } = props ?? {};
    return deleteStudent(id, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useDeleteStudent = (options) => {
  return useMutation(getDeleteStudentMutationOptions(options));
};
const getUploadStudentPhotoUrl = (id) => {
  return `/api/students/${id}/photo`;
};
const uploadStudentPhoto = async (id, photoUploadInput, options) => {
  return customFetch(
    getUploadStudentPhotoUrl(id),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        photoUploadInput
      )
    }
  );
};
const getUploadStudentPhotoMutationOptions = (options) => {
  const mutationKey = ["uploadStudentPhoto"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id, data } = props ?? {};
    return uploadStudentPhoto(id, data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useUploadStudentPhoto = (options) => {
  return useMutation(getUploadStudentPhotoMutationOptions(options));
};
const getGetStudentPaymentsUrl = (id) => {
  return `/api/students/${id}/payments`;
};
const getStudentPayments = async (id, options) => {
  return customFetch(
    getGetStudentPaymentsUrl(id),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetStudentPaymentsQueryKey = (id) => {
  return [
    `/api/students/${id}/payments`
  ];
};
const getGetStudentPaymentsQueryOptions = (id, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetStudentPaymentsQueryKey(id);
  const queryFn = ({ signal }) => getStudentPayments(id, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: !!id, ...queryOptions };
};
function useGetStudentPayments(id, options) {
  const queryOptions = getGetStudentPaymentsQueryOptions(id, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetSeatLayoutUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== void 0) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0 ? `/api/seats?${stringifiedParams}` : `/api/seats`;
};
const getSeatLayout = async (params, options) => {
  return customFetch(
    getGetSeatLayoutUrl(params),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetSeatLayoutQueryKey = (params) => {
  return [
    `/api/seats`,
    ...params ? [params] : []
  ];
};
const getGetSeatLayoutQueryOptions = (params, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetSeatLayoutQueryKey(params);
  const queryFn = ({ signal }) => getSeatLayout(params, { signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetSeatLayout(params, options) {
  const queryOptions = getGetSeatLayoutQueryOptions(params, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getUpdateSeatsConfigUrl = () => {
  return `/api/seats/config`;
};
const updateSeatsConfig = async (seatsConfigInput, options) => {
  return customFetch(
    getUpdateSeatsConfigUrl(),
    {
      ...options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        seatsConfigInput
      )
    }
  );
};
const getUpdateSeatsConfigMutationOptions = (options) => {
  const mutationKey = ["updateSeatsConfig"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return updateSeatsConfig(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useUpdateSeatsConfig = (options) => {
  return useMutation(getUpdateSeatsConfigMutationOptions(options));
};
const getListPaymentsUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== void 0) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0 ? `/api/payments?${stringifiedParams}` : `/api/payments`;
};
const listPayments = async (params, options) => {
  return customFetch(
    getListPaymentsUrl(params),
    {
      ...options,
      method: "GET"
    }
  );
};
const getListPaymentsQueryKey = (params) => {
  return [
    `/api/payments`,
    ...params ? [params] : []
  ];
};
const getListPaymentsQueryOptions = (params, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListPaymentsQueryKey(params);
  const queryFn = ({ signal }) => listPayments(params, { signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useListPayments(params, options) {
  const queryOptions = getListPaymentsQueryOptions(params, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getRecordPaymentUrl = () => {
  return `/api/payments`;
};
const recordPayment = async (paymentInput, options) => {
  return customFetch(
    getRecordPaymentUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        paymentInput
      )
    }
  );
};
const getRecordPaymentMutationOptions = (options) => {
  const mutationKey = ["recordPayment"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return recordPayment(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useRecordPayment = (options) => {
  return useMutation(getRecordPaymentMutationOptions(options));
};
const getGetPaymentUrl = (id) => {
  return `/api/payments/${id}`;
};
const getPayment = async (id, options) => {
  return customFetch(
    getGetPaymentUrl(id),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetPaymentQueryKey = (id) => {
  return [
    `/api/payments/${id}`
  ];
};
const getGetPaymentQueryOptions = (id, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetPaymentQueryKey(id);
  const queryFn = ({ signal }) => getPayment(id, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: !!id, ...queryOptions };
};
function useGetPayment(id, options) {
  const queryOptions = getGetPaymentQueryOptions(id, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getMarkFeePaidUrl = () => {
  return `/api/fees/mark-paid`;
};
const markFeePaid = async (markFeePaidInput, options) => {
  return customFetch(
    getMarkFeePaidUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        markFeePaidInput
      )
    }
  );
};
const getMarkFeePaidMutationOptions = (options) => {
  const mutationKey = ["markFeePaid"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return markFeePaid(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useMarkFeePaid = (options) => {
  return useMutation(getMarkFeePaidMutationOptions(options));
};
const getMarkFeeUnpaidUrl = () => {
  return `/api/fees/mark-unpaid`;
};
const markFeeUnpaid = async (markFeeUnpaidInput, options) => {
  return customFetch(
    getMarkFeeUnpaidUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(
        markFeeUnpaidInput
      )
    }
  );
};
const getMarkFeeUnpaidMutationOptions = (options) => {
  const mutationKey = ["markFeeUnpaid"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return markFeeUnpaid(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useMarkFeeUnpaid = (options) => {
  return useMutation(getMarkFeeUnpaidMutationOptions(options));
};
const getGetMonthlyRevenueReportUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== void 0) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0 ? `/api/reports/monthly-revenue?${stringifiedParams}` : `/api/reports/monthly-revenue`;
};
const getMonthlyRevenueReport = async (params, options) => {
  return customFetch(
    getGetMonthlyRevenueReportUrl(params),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetMonthlyRevenueReportQueryKey = (params) => {
  return [
    `/api/reports/monthly-revenue`,
    ...params ? [params] : []
  ];
};
const getGetMonthlyRevenueReportQueryOptions = (params, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetMonthlyRevenueReportQueryKey(params);
  const queryFn = ({ signal }) => getMonthlyRevenueReport(params, { signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetMonthlyRevenueReport(params, options) {
  const queryOptions = getGetMonthlyRevenueReportQueryOptions(params, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetPendingFeesReportUrl = () => {
  return `/api/reports/pending-fees`;
};
const getPendingFeesReport = async (options) => {
  return customFetch(
    getGetPendingFeesReportUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
const getGetPendingFeesReportQueryKey = () => {
  return [
    `/api/reports/pending-fees`
  ];
};
const getGetPendingFeesReportQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetPendingFeesReportQueryKey();
  const queryFn = ({ signal }) => getPendingFeesReport({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetPendingFeesReport(options) {
  const queryOptions = getGetPendingFeesReportQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
export {
  adminLogin,
  changePassword,
  createStudent,
  deleteStudent,
  forgotPassword,
  getAdminLoginMutationOptions,
  getAdminLoginUrl,
  getChangePasswordMutationOptions,
  getChangePasswordUrl,
  getCreateStudentMutationOptions,
  getCreateStudentUrl,
  getDashboardStats,
  getDeleteStudentMutationOptions,
  getDeleteStudentUrl,
  getDuesToday,
  getForgotPasswordMutationOptions,
  getForgotPasswordUrl,
  getGetDashboardStatsQueryKey,
  getGetDashboardStatsQueryOptions,
  getGetDashboardStatsUrl,
  getGetDuesTodayQueryKey,
  getGetDuesTodayQueryOptions,
  getGetDuesTodayUrl,
  getGetLibraryConfigQueryKey,
  getGetLibraryConfigQueryOptions,
  getGetLibraryConfigUrl,
  getGetMeQueryKey,
  getGetMeQueryOptions,
  getGetMeUrl,
  getGetMonthlyRevenueReportQueryKey,
  getGetMonthlyRevenueReportQueryOptions,
  getGetMonthlyRevenueReportUrl,
  getGetOccupancyAnalyticsQueryKey,
  getGetOccupancyAnalyticsQueryOptions,
  getGetOccupancyAnalyticsUrl,
  getGetOverdueStudentsQueryKey,
  getGetOverdueStudentsQueryOptions,
  getGetOverdueStudentsUrl,
  getGetPaymentQueryKey,
  getGetPaymentQueryOptions,
  getGetPaymentUrl,
  getGetPendingFeesReportQueryKey,
  getGetPendingFeesReportQueryOptions,
  getGetPendingFeesReportUrl,
  getGetPublicLibraryQueryKey,
  getGetPublicLibraryQueryOptions,
  getGetPublicLibraryUrl,
  getGetRecentPaymentsQueryKey,
  getGetRecentPaymentsQueryOptions,
  getGetRecentPaymentsUrl,
  getGetRevenueAnalyticsQueryKey,
  getGetRevenueAnalyticsQueryOptions,
  getGetRevenueAnalyticsUrl,
  getGetSeatLayoutQueryKey,
  getGetSeatLayoutQueryOptions,
  getGetSeatLayoutUrl,
  getGetStudentPaymentsQueryKey,
  getGetStudentPaymentsQueryOptions,
  getGetStudentPaymentsUrl,
  getGetStudentQueryKey,
  getGetStudentQueryOptions,
  getGetStudentUrl,
  getHealthCheckQueryKey,
  getHealthCheckQueryOptions,
  getHealthCheckUrl,
  getLibraryConfig,
  getListPaymentsQueryKey,
  getListPaymentsQueryOptions,
  getListPaymentsUrl,
  getListStudentsQueryKey,
  getListStudentsQueryOptions,
  getListStudentsUrl,
  getMarkFeePaidMutationOptions,
  getMarkFeePaidUrl,
  getMarkFeeUnpaidMutationOptions,
  getMarkFeeUnpaidUrl,
  getMe,
  getMonthlyRevenueReport,
  getOccupancyAnalytics,
  getOverdueStudents,
  getPayment,
  getPendingFeesReport,
  getPublicLibrary,
  getRecentPayments,
  getRecordPaymentMutationOptions,
  getRecordPaymentUrl,
  getRevenueAnalytics,
  getSeatLayout,
  getStudent,
  getStudentPayments,
  getUpdateLibraryConfigMutationOptions,
  getUpdateLibraryConfigUrl,
  getUpdateSeatsConfigMutationOptions,
  getUpdateSeatsConfigUrl,
  getUpdateStudentMutationOptions,
  getUpdateStudentUrl,
  getUploadStudentPhotoMutationOptions,
  getUploadStudentPhotoUrl,
  healthCheck,
  listPayments,
  listStudents,
  markFeePaid,
  markFeeUnpaid,
  recordPayment,
  updateLibraryConfig,
  updateSeatsConfig,
  updateStudent,
  uploadStudentPhoto,
  useAdminLogin,
  useChangePassword,
  useCreateStudent,
  useDeleteStudent,
  useForgotPassword,
  useGetDashboardStats,
  useGetDuesToday,
  useGetLibraryConfig,
  useGetMe,
  useGetMonthlyRevenueReport,
  useGetOccupancyAnalytics,
  useGetOverdueStudents,
  useGetPayment,
  useGetPendingFeesReport,
  useGetPublicLibrary,
  useGetRecentPayments,
  useGetRevenueAnalytics,
  useGetSeatLayout,
  useGetStudent,
  useGetStudentPayments,
  useHealthCheck,
  useListPayments,
  useListStudents,
  useMarkFeePaid,
  useMarkFeeUnpaid,
  useRecordPayment,
  useUpdateLibraryConfig,
  useUpdateSeatsConfig,
  useUpdateStudent,
  useUploadStudentPhoto
};
