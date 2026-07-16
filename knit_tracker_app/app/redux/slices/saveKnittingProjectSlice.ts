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
    finished: boolean
    createdAt: string
    updatedAt: string
}

type DeleteKnitProject = {
    message: string
}

// Grab the csrf token for the users session
const getCsrfToken = async () => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_ROUTE}/csrf/`, {
        credentials: "include",
    });
    if (!result.ok) {
        throw new Error("DID NOT WORK!");
    }
    const {csrfToken} = await result.json();

    console.log("IT WORKED!", csrfToken)
    return csrfToken as string;
}

// The service to send and retrive the knitting project details with the database
export const savedKnittingProjectsAPI = createApi({
    reducerPath: "knittingProjects",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_DJANGO_API_ROUTE,
        credentials: "include",
    }),
    tagTypes: ['KnittingProjects'],
    endpoints: (builder) => {
        return {

            // Grab all of the users projects
            getSavedKnittingProjects: builder.query<KnitProjectInfo[], void> ({
                query: () => ({
                    url: "/userProjects/"
                }),
                providesTags: (result) => 
                    result 
                    ?  ['KnittingProjects', ...result.map((res: KnitProjectInfo) => ({type: 'KnittingProjects' as const, id: res.projectId}))]
                    : ['KnittingProjects'],
            }),

            // Adding a project
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
                    } catch (error) {
                        return {
                            error: {
                                status: 'CUSTOM_ERROR',
                                error: error instanceof Error ? error.message : "Unknown error!"
                            }
                        }
                    }
                },

                // When saving a knitting project,
                // we dont need to cache it since we just saved it,
                // so we assume we dont wanna save the same thing again
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

                // Fetch cache data again after delete
                invalidatesTags: ["KnittingProjects"]
            })
        }
    }
})

export const {useGetSavedKnittingProjectsQuery, useAddKnittingProjectMutation, useDeleteKnittingProjectMutation} = savedKnittingProjectsAPI


