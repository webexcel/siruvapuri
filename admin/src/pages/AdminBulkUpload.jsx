import { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminUserAPI } from '../utils/adminApi';
import { showSuccess, showError, showConfirm } from '../utils/sweetalert';
import { Upload, FileSpreadsheet, Download, Users, CheckCircle, XCircle, AlertCircle, Loader2, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminBulkUpload = () => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const fileInputRef = useRef(null);

  const requiredFields = ['first_name', 'last_name', 'phone', 'age', 'gender'];
  const optionalFields = ['middle_name', 'password', 'payment_status', 'is_approved'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
        showError('Please upload an Excel (.xlsx, .xls) or CSV file');
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and clean data
        const cleanedData = jsonData.map((row, index) => {
          const cleanRow = {
            _rowNumber: index + 2, // Excel row number (1-based + header)
            _isValid: true,
            _errors: []
          };

          // Check required fields
          requiredFields.forEach(field => {
            const value = row[field] || row[field.charAt(0).toUpperCase() + field.slice(1)] || '';
            cleanRow[field] = String(value).trim();
            if (!cleanRow[field]) {
              cleanRow._isValid = false;
              cleanRow._errors.push(`Missing ${field}`);
            }
          });

          // Add optional fields
          optionalFields.forEach(field => {
            const value = row[field] || row[field.charAt(0).toUpperCase() + field.slice(1)] || '';
            if (field === 'is_approved') {
              cleanRow[field] = String(value).toLowerCase() === 'true' || String(value) === '1' || String(value).toLowerCase() === 'yes';
            } else if (field === 'payment_status') {
              cleanRow[field] = String(value).toLowerCase() === 'paid' ? 'paid' : 'unpaid';
            } else {
              cleanRow[field] = String(value).trim();
            }
          });

          // Validate phone (10 digits)
          if (cleanRow.phone && !/^\d{10}$/.test(cleanRow.phone)) {
            cleanRow._isValid = false;
            cleanRow._errors.push('Phone must be 10 digits');
          }

          // Validate age
          const age = parseInt(cleanRow.age);
          if (isNaN(age) || age < 18 || age > 100) {
            cleanRow._isValid = false;
            cleanRow._errors.push('Age must be between 18 and 100');
          } else {
            cleanRow.age = age;
          }

          // Validate gender
          if (!['male', 'female', 'other'].includes(String(cleanRow.gender).toLowerCase())) {
            cleanRow._isValid = false;
            cleanRow._errors.push('Gender must be male, female, or other');
          } else {
            cleanRow.gender = String(cleanRow.gender).toLowerCase();
          }

          return cleanRow;
        });

        setParsedData(cleanedData);
        setUploadResults(null);
      } catch (error) {
        console.error('Error parsing file:', error);
        showError('Failed to parse the file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        first_name: 'John',
        middle_name: '',
        last_name: 'Doe',
        phone: '9876543210',
        age: 25,
        gender: 'male',
        password: 'password123',
        payment_status: 'unpaid',
        is_approved: 'false'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'user_bulk_upload_template.xlsx');
  };

  const handleUpload = async () => {
    const validUsers = parsedData.filter(row => row._isValid);

    if (validUsers.length === 0) {
      showError('No valid users to upload');
      return;
    }

    const confirmed = await showConfirm(
      'Confirm Upload',
      `Are you sure you want to upload ${validUsers.length} users?`
    );

    if (!confirmed) return;

    setUploading(true);
    try {
      // Prepare data for API (remove validation fields)
      const usersToUpload = validUsers.map(({ _rowNumber, _isValid, _errors, ...user }) => user);

      const response = await adminUserAPI.bulkCreateUsers(usersToUpload);

      setUploadResults(response.data.results);

      if (response.data.results.success.length > 0) {
        showSuccess(`Successfully created ${response.data.results.success.length} users!`);
      }

      if (response.data.results.failed.length > 0) {
        showError(`${response.data.results.failed.length} users failed to upload. Check results below.`);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      showError(error.response?.data?.error || 'Failed to upload users');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard!');
  };

  const validCount = parsedData.filter(row => row._isValid).length;
  const invalidCount = parsedData.filter(row => !row._isValid).length;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 p-4 md:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Upload className="text-primary" size={32} />
              Bulk Upload Users
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Upload multiple users at once using Excel or CSV file
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download size={18} />
            Download Template
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="text-primary" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Upload File</h2>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) {
                const fileExt = droppedFile.name.split('.').pop().toLowerCase();
                if (['xlsx', 'xls', 'csv'].includes(fileExt)) {
                  setFile(droppedFile);
                  parseFile(droppedFile);
                } else {
                  showError('Please upload an Excel (.xlsx, .xls) or CSV file');
                }
              }
            }}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="text-green-500" size={48} />
                <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {parsedData.length} rows found | {validCount} valid | {invalidCount} invalid
                </p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-gray-400" size={48} />
                <p className="text-lg font-semibold text-gray-800">
                  Drag & drop your file here
                </p>
                <p className="text-sm text-gray-600">or</p>
                <label className="btn-primary cursor-pointer">
                  Browse Files
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {parsedData.length > 0 && !uploadResults && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="text-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Preview Data</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle size={16} />
                  {validCount} Valid
                </span>
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle size={16} />
                  {invalidCount} Invalid
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Row</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Age</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Gender</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 50).map((row, index) => (
                    <tr key={index} className={`border-b ${!row._isValid ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2">{row._rowNumber}</td>
                      <td className="px-3 py-2">
                        {row._isValid ? (
                          <CheckCircle className="text-green-500" size={18} />
                        ) : (
                          <XCircle className="text-red-500" size={18} />
                        )}
                      </td>
                      <td className="px-3 py-2">{`${row.first_name} ${row.middle_name || ''} ${row.last_name}`.trim()}</td>
                      <td className="px-3 py-2">{row.phone}</td>
                      <td className="px-3 py-2">{row.age}</td>
                      <td className="px-3 py-2 capitalize">{row.gender}</td>
                      <td className="px-3 py-2 text-red-600 text-xs">
                        {row._errors.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 50 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Showing first 50 rows of {parsedData.length}
                </p>
              )}
            </div>

            {/* Upload Button */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || validCount === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload {validCount} Users
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {uploadResults && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{uploadResults.total}</p>
                <p className="text-sm text-blue-700">Total Processed</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{uploadResults.success.length}</p>
                <p className="text-sm text-green-700">Successfully Created</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{uploadResults.failed.length}</p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
            </div>

            {/* Success Table */}
            {uploadResults.success.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={24} />
                    <h2 className="text-xl font-semibold text-gray-800">Successfully Created Users</h2>
                  </div>
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPasswords ? 'Hide' : 'Show'} Passwords
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">ID</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Password</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResults.success.map((user, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{user.id}</td>
                          <td className="px-3 py-2">{user.name}</td>
                          <td className="px-3 py-2 font-mono">
                            {showPasswords ? user.password : '••••••••'}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => copyToClipboard(`Phone: ${user.phone}\nPassword: ${user.password}`)}
                              className="text-primary hover:text-primary-dark"
                              title="Copy credentials"
                            >
                              <Copy size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Failed Table */}
            {uploadResults.failed.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="text-red-500" size={24} />
                  <h2 className="text-xl font-semibold text-gray-800">Failed Users</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResults.failed.map((user, index) => (
                        <tr key={index} className="border-b hover:bg-red-50">
                          <td className="px-3 py-2 text-red-600">{user.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* New Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="btn-primary flex items-center gap-2"
              >
                <Upload size={18} />
                Upload Another File
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Download the template file to see the required format</li>
                <li><strong>Required fields:</strong> first_name, last_name, phone, age, gender</li>
                <li><strong>Optional fields:</strong> middle_name, password, payment_status (paid/unpaid), is_approved (true/false)</li>
                <li>Phone number must be exactly 10 digits</li>
                <li>Age must be between 18 and 100</li>
                <li>Gender must be: male, female, or other</li>
                <li>If password is not provided, a random password will be generated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBulkUpload;
