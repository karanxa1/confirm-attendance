/**
 * Function to export attendance data to Excel
 */
async function exportToExcel() {
    const classId = document.getElementById('report-class').value;
    const fromDate = document.getElementById('report-date-from').value;
    const toDate = document.getElementById('report-date-to').value;
    
    if (!classId || !fromDate || !toDate) {
        showToast('Please select class and date range', 'error');
        return;
    }
    
    const resultDiv = document.getElementById('report-result');
    resultDiv.innerHTML = 'Exporting to Excel...';
    
    // Get the base URL dynamically to support both local development and production
    // Define baseUrl outside the try block so it's accessible in the catch block
    const baseUrl = window.location.origin;
    
    try {
        // Make sure token exists and is properly formatted
        const token = localStorage.getItem('token');
        if (!token) {
            // Use the showToast function from the parent scope if available, otherwise use console.error
            if (typeof showToast === 'function') {
                showToast('Authentication token missing. Please log in again.', 'error');
            } else {
                console.error('Authentication token missing. Please log in again.');
            }
            localStorage.clear();
            // Redirect to login page
            location.reload();
            return;
        }

        // Refresh token before making the request
        try {
            // Try to access refreshToken function from parent scope
            if (typeof refreshToken === 'function') {
                await refreshToken();
            } else {
                console.log('refreshToken function not available, continuing with current token');
            }
        } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Continue with the current token
        }

        // Use fetch with proper Authorization header instead of form submission
        // Ensure we're using the correct API endpoint path
        console.log('Making API request to:', `${baseUrl}/api/export-to-excel`);
        const response = await fetch(`${baseUrl}/api/export-to-excel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                classId,
                fromDate,
                toDate
            })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                // Redirect to login page
                location.reload();
                throw new Error('Session expired, please log in again');
            }
            throw new Error(`Failed to export to Excel: ${response.statusText}`);
        }
        
        // For file download, we need to create a blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${classId}_${fromDate}_to_${toDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        resultDiv.innerHTML = `
            <h4>Export Initiated</h4>
            <p>Your attendance data is being exported to Excel.</p>
            <p>The file will download automatically.</p>
        `;
        // Use the showToast function from the parent scope if available
        if (typeof showToast === 'function') {
            showToast('Excel export initiated', 'success');
        } else {
            console.log('Excel export initiated');
        }
    } catch (error) {
        resultDiv.innerHTML = 'Error exporting to Excel';
        // Use the showToast function from the parent scope if available
        if (typeof showToast === 'function') {
            showToast(`Error exporting to Excel: ${error.message}`, 'error');
        } else {
            console.error(`Error exporting to Excel: ${error.message}`);
        }
        // Add more detailed logging to help diagnose URL-related issues
        console.error('Error exporting to Excel:', error);
        console.log('Request details:', {
            baseUrl: baseUrl,
            endpoint: `${baseUrl}/api/export-to-excel`,
            headers: {
                'Authorization': 'Bearer [TOKEN]', // Not showing actual token for security
                'Content-Type': 'application/json'
            },
            body: {
                classId,
                fromDate,
                toDate
            }
        });
        
        // Check if it's a network error and provide more helpful information
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            console.error('Network error detected. This could be because:');
            console.error('1. The server is not running');
            console.error('2. The server is running on a different port');
            console.error('3. There might be a CORS issue');
            console.error('4. The network connection is blocked by a firewall or proxy');
            
            resultDiv.innerHTML = `
                <h4>Connection Error</h4>
                <p>Unable to connect to the server. Please check that:</p>
                <ul>
                    <li>The server is running</li>
                    <li>You are connected to the internet</li>
                    <li>There are no firewall or proxy issues</li>
                </ul>
                <p>Technical details: ${error.message}</p>
            `;
        }
    }
}