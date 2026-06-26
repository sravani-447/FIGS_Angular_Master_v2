import { Component, OnInit } from '@angular/core';
import { ServerRequests } from '../../../services/ServerRequests';

@Component({
  selector: 'app-data-dump',
  templateUrl: './data-dump.component.html',
  styleUrls: ['./data-dump.component.css']
})
export class DataDumpComponent implements OnInit {

  selectedFile: File | null = null;
  selectedFileName: string = '';
  isLoading: boolean = false;
  uploadMessage: string = '';
  uploadSuccess: boolean = false;
  uploadError: boolean = false;

  constructor(private serverRequests: ServerRequests) { }

  ngOnInit(): void {
  }

  /**
   * Handle file selection from input
   * @param event File input change event
   */
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.selectedFileName = this.selectedFile.name;
      this.uploadMessage = '';
      this.uploadSuccess = false;
      this.uploadError = false;
    }
  }

  /**
   * Validate if the selected file is an Excel file
   * @returns true if valid Excel file
   */
  isValidExcelFile(): boolean {
    if (!this.selectedFile) {
      return false;
    }

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'text/plain'
    ];

    const validExtensions = [
      '.xls',
      '.xlsx',
      '.csv'
    ];

    const fileExtension =
      this.selectedFile.name
        .substring(this.selectedFile.name.lastIndexOf('.'))
        .toLowerCase();

    return (
      validTypes.includes(this.selectedFile.type) ||
      validExtensions.includes(fileExtension)
    );
  }

  /**
   * Upload the selected Excel file to server
   */
  uploadFile(): void {
    if (!this.selectedFile) {
      this.uploadError = true;
      this.uploadMessage = 'Please select a file first.';
      return;
    }

    if (!this.isValidExcelFile()) {
      this.uploadError = true;
      this.uploadMessage = 'Please select a valid Excel file (.xls, .xlsx, or .csv)';
      return;
    }

    this.isLoading = true;
    this.uploadMessage = 'Uploading file...';
    this.uploadSuccess = false;
    this.uploadError = false;

    // Convert file to Base64 and upload
    this.fileToBase64(this.selectedFile).then((base64Content: string) => {
      const fileData = {
        fileName: this.selectedFile!.name,
        fileContent: base64Content
      };

      // Call the service to upload the file
      this.serverRequests.uploadDataDump(fileData).subscribe(
        (response: any) => {
          this.isLoading = false;
          if (response && response.StatusCode === 0) {
            this.uploadSuccess = true;
            this.uploadMessage = response.Message || 'File uploaded successfully!';
            this.resetFileInput();
          } else {
            this.uploadError = true;
            this.uploadMessage = response?.Message || 'Upload failed. Please try again.';
          }
        },
        (error: any) => {
          this.isLoading = false;
          this.uploadError = true;
          this.uploadMessage = error?.error?.Message || 'An error occurred while uploading the file.';
          console.error('Upload error:', error);
        }
      );
    }).catch((error) => {
      this.isLoading = false;
      this.uploadError = true;
      this.uploadMessage = 'Error reading file. Please try again.';
      console.error('File read error:', error);
    });
  }

  /**
   * Convert file to Base64 string
   * @param file The file to convert
   * @returns Promise with Base64 string (without data URL prefix)
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const binary = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(binary);
        let binaryString = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binaryString);
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Reset the file input
   */
  resetFileInput(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Cancel upload and clear selection
   */
  cancel(): void {
    this.resetFileInput();
    this.uploadMessage = '';
    this.uploadSuccess = false;
    this.uploadError = false;
  }
}
