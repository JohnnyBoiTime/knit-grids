import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react"

// Information to send to database to store
// users knitting project
type KnitProjectFormat = {
    nameOfProject: string
    stitches: number
    needles: {
    type: string
    size: string
    }
    yarn: {
        material: string
        weight: string
        yardage: string
    }
    progressGrid: string[][]
    finished: boolean
}

// Used to display info on saved projects page,
// to provide an overview of the project on the
// "View Projects" page, as well as 
// to display selected projects information
// in the main project page
type KnitProjectInfo = {
    projectId: string
    nameOfProject: string
    stitches: number
    needles: {
    type: string
    size: string
    }
    yarn: {
        material: string
        weight: string
        yardage: string
    }
    progressGrid: string[][]
    notes: string
    rowNotes: string[]
    autofill: string
    finished: boolean
    createdAt: string
    updatedAt: string
}

type DeleteKnitProject = {
    message: string
}

// Grab the csrf token for the users session
const getCsrfToken = async () => {
   /* const result = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_ROUTE}/csrf/`, {
        credentials: "include",
    });
    */

    const result = await fetch(`${process.env.NEXT_PUBLIC_ASPNET_API_ROUTE}/api/csrf/`, {
        credentials: "include",
    });

    if (!result.ok) {
        throw new Error("DID NOT WORK!");
    }
    const {csrfToken} = await result.json();

    return csrfToken as string;
}

// The service to send and retrive the knitting project details with he backend!
export const savedKnittingProjectsAPI = createApi({
    reducerPath: "knittingProjects", // Store the state in the store under knittingProjects
    baseQuery: fetchBaseQuery({
        // baseUrl: process.env.NEXT_PUBLIC_DJANGO_API_ROUTE,
        // Every base query will include credientials and point to the backend
        baseUrl: `${process.env.NEXT_PUBLIC_ASPNET_API_ROUTE}/api`,
        credentials: "include",
    }),
    tagTypes: ['KnittingProjects'], // Cache tags for refreshing information when changing information.
    endpoints: (builder) => {
        return {

            // Grab all of the users projects. Query => Grab data.
            // Return data in format of KnitProjectInfo[].
            getSavedKnittingProjects: builder.query<KnitProjectInfo[], void> ({
                query: () => ({
                    url: "/userProjects/"
                }),
                providesTags: (result) => 
                    result 
                // Caches result so if we delete a project, we can refresh the list
                // to reflect the deletion.
                    ?  ['KnittingProjects', ...result.map((res: KnitProjectInfo) => ({type: 'KnittingProjects' as const, id: res.projectId}))]
                    : ['KnittingProjects'],
            }),

            // Adding a project. Returns the project info in the format of KnitProjectInfo,
            // and we put in the format of the project.
            // This also modifies the project as well, so for both saving and modifying.
            addKnittingProject: builder.mutation<KnitProjectInfo, KnitProjectFormat>({
                async queryFn(knitProject, queryAPI, extraOptions, baseQuery) {
                    try {

                        // Make the request
                        const csrfToken = await getCsrfToken()
                        const res = await baseQuery({
                            url: "/userProjects/",
                            method: "POST",
                            body: knitProject,
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfToken,
                            },
                        })

                        // See if we get any errors from the backend when
                        // retrieving.
                        // List of errors: https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery
                        if ('error' in res) {
                            return {error: res.error as FetchBaseQueryError}
                        }

                        // Got our data!
                        return { data: res.data as KnitProjectInfo}

                    // We caught something bad during runtime :(
                    // Stuff like csrf fetching error or JSON parsing failure.
                    } catch (error) {
                        return {
                            error: {
                                status: 'CUSTOM_ERROR',
                                error: error instanceof Error ? error.message : "Unknown error!"
                            }
                        }
                    }
                },

                // Refresh the cache due to a change of data,
                // refetch the saving the project.
                invalidatesTags: ['KnittingProjects']
            }),
            
            // For updating an existing knitting project.
            updateKnitingProject: builder.mutation<KnitProjectInfo, KnitProjectFormat>({
                async queryFn(updateProject, api, options, baseQuery) {
                        try {

                        // Make the request
                        const csrfToken = await getCsrfToken()
                        const res = await baseQuery({
                            url: "/userProjects/",
                            method: "PUT",
                            body: updateProject,
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfToken,
                            },
                        })

                        // See if we get any errors from the backend when
                        // retrieving.
                        // List of errors: https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery
                        if ('error' in res) {
                            return {error: res.error as FetchBaseQueryError}
                        }

                        // Got our data!
                        return { data: res.data as KnitProjectInfo}

                    // We caught something bad during runtime :(
                    // Stuff like csrf fetching error or JSON parsing failure.
                    } catch (error) {
                        return {
                            error: {
                                status: 'CUSTOM_ERROR',
                                error: error instanceof Error ? error.message : "Unknown error!"
                            }
                        }
                    }
                },

                // Refresh the cache due to a change of data,
                // refetch the saving the project.
                invalidatesTags: ['KnittingProjects']
            }),
            
            // Delete a knitting project
            deleteKnittingProject: builder.mutation<string, string>({
                 async queryFn(projectId, queryAPI, extraOptions, baseQuery) {
                    try {
                        // Make the request
                        const csrfToken = await getCsrfToken()
                        const res = await baseQuery({
                            url: "/userProjects/",
                            method: "DELETE",
                            body: {
                                projectId: projectId
                            },
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfToken,
                            },
                        })

                        // See if we get any errors from the backend when
                        // retrieving.
                        // List of errors: https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery
                        if ('error' in res) {
                            return {error: res.error as FetchBaseQueryError}
                        }

                        const response = res.data as DeleteKnitProject

                        // Got our data!
                        return { data: response.message}

                    // We caught something bad during runtime :(
                    } catch (error) {
                        return {
                            error: {
                                status: 'CUSTOM_ERROR',
                                error: error instanceof Error ? error.message : "Unknown error!"
                            }
                        }
                    }
                },

                // Refresh cache by refetching information since we deleted a project.
                invalidatesTags: ["KnittingProjects"]
            })
        }
    }
})

export const {useGetSavedKnittingProjectsQuery, useAddKnittingProjectMutation, useUpdateKnitingProjectMutation, useDeleteKnittingProjectMutation} = savedKnittingProjectsAPI


