-- Create a function to execute dynamic SQL queries
-- This is used by the query runner script for interactive database access

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    query_result record;
    rows_array json[] := '{}';
BEGIN
    -- Execute the query and collect results
    FOR query_result IN EXECUTE sql LOOP
        rows_array := array_append(rows_array, to_json(query_result));
    END LOOP;
    
    -- Return the results as JSON
    result := json_build_object(
        'data', rows_array,
        'row_count', array_length(rows_array, 1)
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'error', true,
            'message', SQLERRM,
            'detail', SQLSTATE
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon; 