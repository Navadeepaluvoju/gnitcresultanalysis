// Ensure that the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Function to normalize text for comparison (ignores case and spaces)
    function normalizeText(text) {
        return text ? text.toLowerCase().replace(/\s+/g, '') : '';
    }

    // Function to calculate average pass percentage for a specific subject and year
    function calculateAveragePass(teacherData, subject, currentYear, yearsAgo) {
        const yearParts = currentYear.split('-').map(part => parseInt(part));
        const yearToCheck = (yearParts[0] - yearsAgo) + '-' + (yearParts[1] - yearsAgo);
        const branch = subject['Branch'];
        const section = subject['Section'];
        const bTechYear = subject['B. Tech. Year'];
        const sem = subject['Sem'];
        const subjectName = normalizeText(subject['Name of the subject']);

        // Create a Set to track unique combinations of section and subject
        const uniqueEntries = new Set();
        
        // Initialize sums for passed and appeared students
        let totalPassed = 0;
        let totalAppeared = 0;

        // Filter records for the specified year, branch, B. Tech. year, and semester
        const subjectsForYear = teacherData.filter(t =>
            t['Academic Year'] === yearToCheck &&
            t['Branch'] === branch &&
            t['B. Tech. Year'] === bTechYear &&
            t['Sem'] === sem &&
            normalizeText(t['Name of the subject']) === subjectName
        );

        // Calculate the total number of students passed and appeared considering unique entries
        subjectsForYear.forEach(t => {
            const uniqueKey = `${t['Section']}-${normalizeText(t['Name of the subject'])}`;

            if (!uniqueEntries.has(uniqueKey)) {
                uniqueEntries.add(uniqueKey);
                totalPassed += parseInt(t['No of Students passed']) || 0;
                totalAppeared += parseInt(t['No of Students Appeared']) || 0;
            }
        });

        // Calculate average pass percentage
        if (totalAppeared > 0) {
            const averagePassPercentage = (totalPassed / totalAppeared) * 100;
            return averagePassPercentage.toFixed(2); // Return average formatted to two decimal places
        } else {
            return 'N/A'; // Return 'N/A' if no students appeared
        }
    }

    // Function to calculate section average pass percentage
    function calculateSectionAverage(teacherData, academicYear, bTechYear, sem, section) {
        // Filter data for the specified academic year, B. Tech. year, semester, and section
        const relevantSubjects = teacherData.filter(t => 
            t['Academic Year'] === academicYear &&
            t['B. Tech. Year'] === bTechYear &&
            t['Sem'] === sem &&
            t['Section'] === section &&
            !/lab|laboratory/i.test(t['Name of the subject']) // Exclude lab subjects
        );

        // Initialize totals for passed and appeared students
        let totalPassed = 0;
        let totalAppeared = 0;
        

        // Set to track unique subject-section combinations
        const uniqueSubjects = new Set();

        // Loop through all subjects for the given section and aggregate total passed and appeared
        relevantSubjects.forEach(sub => {
            // Create a unique key for the subject (based on B. Tech. Year, Sem, Section, and Subject Name)
            const uniqueKey = `${sub['B. Tech. Year']}-${sub['Sem']}-${sub['Section']}-${normalizeText(sub['Name of the subject'])}`;

            // Only add to totals if the subject is unique
            if (!uniqueSubjects.has(uniqueKey)) {
                uniqueSubjects.add(uniqueKey); // Add this subject to the Set
                totalPassed += parseInt(sub['No of Students passed']) || 0;
                totalAppeared += parseInt(sub['No of Students Appeared']) || 0;
            }
        });

        // Calculate the overall section pass percentage across all theory subjects
        if (totalAppeared > 0) {
            return (totalPassed / totalAppeared * 100).toFixed(2); // Return percentage formatted to 2 decimal places
        } else {
            return 'N/A'; // Return 'N/A' if no students appeared
        }
    }

    function generatePDF(teacherName, dept, designation, empId) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
    
        // Add a banner to the PDF
        doc.setFontSize(22);
        const imgData = 'gni banner.jpeg'; // Replace with your actual base64 image string
        const headerHeight = 100; // Increased height for the header
        const pdfWidth = doc.internal.pageSize.getWidth();
    
        // Set image to cover the entire header
        doc.addImage(imgData, 'PNG',0, 0, pdfWidth, headerHeight);
    
        // Add the title below the image
        doc.setTextColor(234, 46, 46); // Red color for the title
        doc.setFontSize(24); // Larger font for the title
        doc.text('Result Analysis', pdfWidth / 2, headerHeight + 20, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    
        // Add faculty details with improved spacing
        doc.setFontSize(15);
        const detailsStartY = headerHeight + 60; // Start position for details
        const lineHeight = 15;
        const marginX = 40;  // Height for each line
        doc.text(`Faculty Name : ${teacherName}`, marginX, detailsStartY);
        doc.text(`Department   : ${dept}`, marginX, detailsStartY + lineHeight + 10); // Increased spacing
        doc.text(`Designation  : ${designation}`, marginX, detailsStartY + lineHeight * 2 + 20); // Increased spacing
        doc.text(`Employee ID  : ${empId}`, marginX, detailsStartY + lineHeight * 3 + 30);
        doc.setFontSize(18);// Increased spaci
        doc.text('Academic Overview',marginX+170, detailsStartY + lineHeight * 4 + 40); // Added line for Acad
        // Add some spacing before the tables
        let startY = detailsStartY + lineHeight * 5 + 50;
    
        // Add some spacing before the tables
       // Extra spacing before tables
    
        // Select all table elements from the document
        const tables = document.querySelectorAll('table');
    
        if (tables.length > 0) {
            
            tables.forEach((table, index) => {
                // Use autoTable to add the HTML table to the PDF
                doc.autoTable({
                    html: table,
                    startY: startY,
                    styles: {
                        fontSize: 10,
                        cellPadding: 5,
                        valign: 'middle',
                        halign: 'center',
                        overflow: 'linebreak',
                        lineWidth: 2, // Set line width for borders
                    },
                    headStyles: {
                        fillColor: [244, 244, 244], // Light grey for header
                        textColor: [0, 0, 0], // Black header text
                        fontStyle: 'bold',
                        lineWidth: 2, // Thicker header border
                    },
                    bodyStyles: {
                        lineWidth: 2, // Thicker body border
                    },
                    alternateRowStyles: {
                        fillColor: [240, 240, 240], // Light grey for alternate rows
                    },
                    margin: {  autoTable: startY },
                    tableWidth: 'auto',
                    pageBreak: 'auto',
                });
    
                // Update the starting Y position for the next table
                startY = doc.lastAutoTable.finalY + 30; // Adjust for space between tables
            });
    
     // Add signature placeholders
const finalY = doc.autoTable.previous.finalY + 20; // Space after the last table
const pageWidth = doc.internal.pageSize.getWidth();

// Calculate the Y position for signatures with a 5-line gap
const lineHeight = 15; // Define line height
const gapAfterTable = lineHeight * 5; // 5-line gap
const signatureYPosition = finalY + gapAfterTable;

// Signature of COE on the left
doc.text(' Signature of Faculty', 10, signatureYPosition);

// Calculate the width of the Director's signature text
const directorSignatureText = 'Controller Of Examinations ';
const directorTextWidth = doc.getTextWidth(directorSignatureText);

// Ensure it fits within the page
const directorXPosition = pageWidth - directorTextWidth - 10; // Add some padding

// Signature of Director on the right
doc.text(directorSignatureText, directorXPosition, signatureYPosition);

    
            // Save the PDF with a name
            doc.save('faculty_report.pdf');
        } else {
            alert('No tables found to generate PDF.');
        }
    }
    
    


let teacherName; 
let dept;
let empId;
let designation;

    // Fetching the teacher data from the JSON file
    fetch('teacherData.json')
    
        .then(response => response.json())
        .then(teacherData => {
            const form = document.getElementById('teacherForm');
            const resultDiv = document.getElementById('result');
            const printButton = document.getElementById('printButton');

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Retrieve form values
                const empCode = document.getElementById('empCode').value.trim();
                const department = document.getElementById('department').value.trim();
                designation = document.getElementById('designation').value.trim();
                const subjectType = document.getElementById('subjectType').value; // 'theory' or 'lab'

                // Validate subject type selection
                if (!subjectType) {
                    alert('Please select a Subject Type (Theory or Lab).');
                    return;
                }

                const normalizedEmpCode = empCode.replace(/\s+/g, '');

                // Filter teacher details based on EMP Code
                const teacherDetails = teacherData.filter(t => {
                    return (normalizedEmpCode === '' || t['EMP Code'].replace(/\s+/g, '') === normalizedEmpCode);
                });

                if (teacherDetails.length > 0) {
                    const firstTeacher = teacherDetails[0];
                    teacherName = firstTeacher['Name of the teacher'] || 'Not Available';
                    dept = department || 'Not Provided';
                    empId = firstTeacher['EMP Code'] ? firstTeacher['EMP Code'].replace(/\s+/g, '') : 'Not Available';
                    const designationValue = designation || 'Not Provided';

                    // Separate lab subjects and lecture subjects based on dropdown selection
                    let selectedSubjects;
                    let subjectTitle;
                    if (subjectType === 'lab') {
                        selectedSubjects = teacherDetails.filter(teacher => /lab|laboratory/i.test(teacher['Name of the subject']));
                        subjectTitle = "Lab Subjects";
                    } else {
                        selectedSubjects = teacherDetails.filter(teacher => !/lab|laboratory/i.test(teacher['Name of the subject']));
                        subjectTitle = "Theory Subjects";
                    }

                    // Initialize the output HTML with teacher details
                    let outputHtml = `<h2>Faculty Name: ${teacherName}</h2>
                                      <h2>Department: ${dept}</h2>
                                      <h2>Designation: ${designationValue}</h2>
                                      <h2>Employee ID: ${empId}</h2>`;

                    if (subjectType === 'theory') {
                        // For Theory, include average pass percentages over the last 5 years
                        // Get unique academic years, sort them in descending order, and select the last 5
                        const academicYears = [...new Set(selectedSubjects.map(t => t['Academic Year']))]
                            .sort((a, b) => parseInt(b.split('-')[0]) - parseInt(a.split('-')[0])) // Sort by year in descending order
                            .slice(0, 5); // Take the most recent 5 years

                        // Loop through each academic year and create a table
                        academicYears.forEach(year => {
                            const yearSubjects = selectedSubjects.filter(t => t['Academic Year'] === year);

                            if (yearSubjects.length > 0) {
                                // Determine the academic years for the past 5 years
                                const pastYears = [];
                                for (let i = 0; i < 3; i++) {
                                    const pastYear = (parseInt(year.split('-')[0]) - i) + '-' + (parseInt(year.split('-')[1]) - i);
                                    pastYears.push(pastYear);
                                }
                                outputHtml += `<h3>Theory Subjects for ${year}</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr>
                <th rowspan="2">B. Tech. Year</th>
                <th rowspan="2">Sem</th>
                <th rowspan="2">Section</th>
                <th rowspan="2">Name of the Subject</th>
                <th>Faculty result %</th>
                <th rowspan="2">Section Average</th> 
                <th colspan="4">Average Results % in Subject in all Sections</th>

            </tr>
            <tr>
            <th>${pastYears[0]}</th>
                <th>${pastYears[0]}</th>
                <th>${pastYears[1]}</th>
                <th>${pastYears[2]}</th>

            </tr>
        </thead>
        <tbody>`;

                                yearSubjects.forEach(sub => {
                                    const avgCurrentYearPass = calculateAveragePass(teacherData, sub, year, 0); // Current Year
                                    const pastYear1AvgPass = calculateAveragePass(teacherData, sub, year, 1); // Past Year 1
                                    const pastYear2AvgPass = calculateAveragePass(teacherData, sub, year, 2); // Past Year 2
                                    const pastYear3AvgPass = calculateAveragePass(teacherData, sub, year, 3); // Past Year 3
                                    const pastYear4AvgPass = calculateAveragePass(teacherData, sub, year, 4); // Past Year 4

                                    // Calculate section average
                                    const sectionAverage = calculateSectionAverage(teacherData, year, sub['B. Tech. Year'], sub['Sem'], sub['Section']);

                                    outputHtml += `<tr>
                                        <td>${sub['B. Tech. Year']}</td>
                                        <td>${sub['Sem']}</td>
                                        <td>${sub['Section']}</td>
                                        <td>${sub['Name of the subject']}</td>
                                        <td>${(parseFloat(sub['% of Pass']) || 0).toFixed(2)}</td>
                                         <td>${sectionAverage}</td> <!-- New Section Average Column -->
                                        <td>${avgCurrentYearPass}</td>
                                        <td>${pastYear1AvgPass}</td>
                                        <td>${pastYear2AvgPass}</td>
                                       
                                    </tr>`;
                                });

                                outputHtml += `</tbody></table>`;
                            }
                        });
                    } else {
                        // For Lab, display subjects without average pass percentages
                        if (selectedSubjects.length > 0) {
                            outputHtml += `<h3>${subjectTitle}</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr>
                <th>Academic Year</th>
                <th>B. Tech. Year</th>
                <th>Sem</th>
                <th>Section</th>
                <th>Name of the Subject</th>
                <th>% of Pass</th>
            </tr>
        </thead>
        <tbody>`;

                            selectedSubjects.forEach(teacher => {
                                outputHtml += `<tr>
                                    <td>${teacher['Academic Year']}</td>
                                    <td>${teacher['B. Tech. Year']}</td>
                                    <td>${teacher['Sem']}</td>
                                    <td>${teacher['Section']}</td>
                                    <td>${teacher['Name of the subject']}</td>
                                    <td>${(parseFloat(teacher['% of Pass']) || 0).toFixed(2)}</td> 
                                </tr>`;
                            });

                            outputHtml += `</tbody></table>`;
                        } else {
                            outputHtml += `<h3>No Lab Subjects Found.</h3>`;
                        }
                    }

                    // Add signature placeholders
                    outputHtml += `<div class="signature" style="margin-top: 20px;">
                                      <p>Signature of COE: ________________________</p>
                                      <p>Signature of Director: ________________________</p>
                                  </div>`;

                    // Set the result HTML
                    resultDiv.innerHTML = outputHtml;

                    // Show the print button
                    printButton.style.display = 'block';
                } else {
                    resultDiv.innerHTML = `<h2>No details found for the entered EMP Code.</h2>`;
                    printButton.style.display = 'none';
                }
            });

            // Add a click event listener to the print button
            printButton.addEventListener('click', function() {
                // Generate and download the PDF
                generatePDF(teacherName, dept, designation, empId);
            });
        })
        .catch(error => console.error('Error loading teacher data:', error));

});
