const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// URL dictionary - same as in the original application
const url_dict = {
    'DSAI': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=DSAI&bolum=ARTIFICIAL+INTELLIGENCE',
    'ASIA': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ASIA&bolum=ASIAN+STUDIES',
    'ASIL': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ASIA&bolum=ASIAN+STUDIES',
    'ATA': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ATA&bolum=ATATURK+INSTITUTE+FOR+MODERN+TURKISH+HISTORY',
    'HTR': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ATA&bolum=ATATURK+INSTITUTE+FOR+MODERN+TURKISH+HISTORY',
    'AUTO': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=AUTO&bolum=AUTOMOTIVE+ENGINEERING',
    'BM': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=BM&bolum=BIOMEDICAL+ENGINEERING',
    'BIS': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=BIS&bolum=BUSINESS+INFORMATION+SYSTEMS',
    'CHE': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CHE&bolum=CHEMICAL+ENGINEERING',
    'CHEM': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CHEM&bolum=CHEMISTRY',
    'STS': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CHEM&bolum=CHEMISTRY',
    'CE': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CE&bolum=CIVIL+ENGINEERING',
    'ENGG': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CE&bolum=CIVIL+ENGINEERING',
    'COGS': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=COGS&bolum=COGNITIVE+SCIENCE',
    'CSE': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CSE&bolum=COMPUTATIONAL+SCIENCE+%26+ENGINEERING',
    'CET': ['https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CET&bolum=COMPUTER+EDUCATION+%26+EDUCATIONAL+TECHNOLOGY', "https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CET&bolum=EDUCATIONAL+TECHNOLOGY"],
    'CMPE': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CMPE&bolum=COMPUTER+ENGINEERING',
    'CEM': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CEM&bolum=CONSTRUCTION+ENGINEERING+AND+MANAGEMENT',
    'CCS': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=CCS&bolum=CRITICAL+AND+CULTURAL+STUDIES',
    'PRED': ['https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PRED&bolum=EARLY+CHILDHOOD+EDUCATION',"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PRSO&bolum=UNDERGRADUATE+PROGRAM+IN+PRESCHOOL+EDUCATION"],
    'EQE': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=EQE&bolum=EARTHQUAKE+ENGINEERING',
    'EC': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=EC&bolum=ECONOMICS',
    'ED': ["https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ED&bolum=EDUCATIONAL+SCIENCES","https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=GUID&bolum=GUIDANCE+%26+PSYCHOLOGICAL+COUNSELING" ],
    'EE': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=EE&bolum=ELECTRICAL+%26+ELECTRONICS+ENGINEERING',
    'ETM': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ETM&bolum=ENGINEERING+AND+TECHNOLOGY+MANAGEMENT',
    'ESC': ['https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ENV&bolum=ENVIRONMENTAL+SCIENCES',"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ENVT&bolum=ENVIRONMENTAL+TECHNOLOGY"],
    'ADEX': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=XMBA&bolum=EXECUTIVE+MBA',
    'PA': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PA&bolum=FINE+ARTS',
    'FLED': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=FLED&bolum=FOREIGN+LANGUAGE+EDUCATION',
    'GED': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=GED&bolum=GEODESY',
    'GPH': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=GPH&bolum=GEOPHYSICS',
    'GR': '',
    'HIST': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=HIST&bolum=HISTORY',
    'LAT': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=HIST&bolum=HISTORY',
    'HUM': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=HUM&bolum=HUMANITIES+COURSES+COORDINATOR',
    'IE': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=IE&bolum=INDUSTRIAL+ENGINEERING',
    'INCT': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=INCT&bolum=INTERNATIONAL+COMPETITION+AND+TRADE',
    'INTT': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=INTT&bolum=INTERNATIONAL+TRADE',
    'LAW': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LAW&bolum=LAW+PR.',
    'LS': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LS&bolum=LEARNING+SCIENCES',
    'CAU': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LING&bolum=LINGUISTICS',
    'LING': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LING&bolum=LINGUISTICS',
    'TID': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LING&bolum=LINGUISTICS',
    'AD': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=AD&bolum=MANAGEMENT',
    'MIS': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=MIS&bolum=MANAGEMENT+INFORMATION+SYSTEMS',
    'MATH': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=MATH&bolum=MATHEMATICS',
    'SCED': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=SCED&bolum=MATHEMATICS+AND+SCIENCE+EDUCATION',
    'ME': 'https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=ME&bolum=MECHANICAL+ENGINEERING',
    'MECA': ["https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=MECA&bolum=MECHATRONICS+ENGINEERING+(WITH+THESIS)","https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=MECA&bolum=MECHATRONICS+ENGINEERING+(WITH+THESIS)"],
    "BIO":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=BIO&bolum=MOLECULAR+BIOLOGY+%26+GENETICS",
    "PHIL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PHIL&bolum=PHILOSOPHY",
    "PE":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PE&bolum=PHYSICAL+EDUCATION",
    "PHYL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PHYS&bolum=PHYSICS",
    "PHYS":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PHYS&bolum=PHYSICS",
    "POLS":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=POLS&bolum=POLITICAL+SCIENCE%26INTERNATIONAL+RELATIONS",
    "PSY":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=PSY&bolum=PSYCHOLOGY",
    "AE":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "ARM":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "CHIN":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "FR":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "GER":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "ITA":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "JP":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "KR":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "POR":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "RUS":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "SPA":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=YADYOK&bolum=SCHOOL+OF+FOREIGN+LANGUAGES",
    "SPL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=SPL&bolum=SOCIAL+POLICY+WITH+THESIS",
    "KRD":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=SOC&bolum=SOCIOLOGY",
    "SOC":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=SOC&bolum=SOCIOLOGY",
    "SWE":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=SWE&bolum=SOFTWARE+ENGINEERING",
    "TRM":["https://registration.bogazici.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TRM&bolum=SUSTAINABLE+TOURISM+MANAGEMENT","https://registration.bogazici.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TRM&bolum=TOURISM+MANAGEMENT"],
    "SCO":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=SCO&bolum=SYSTEMS+%26+CONTROL+ENGINEERING",
    "TR":["https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=WTR&bolum=TRANSLATION","https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TR&bolum=TRANSLATION+AND+INTERPRETING+STUDIES"],
    "INT":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TR&bolum=TRANSLATION+AND+INTERPRETING+STUDIES",
    "TK":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TK&bolum=TURKISH+COURSES+COORDINATOR",
    "AR":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TKL&bolum=TURKISH+LANGUAGE+%26+LITERATURE",
    "PER":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TKL&bolum=TURKISH+LANGUAGE+%26+LITERATURE",
    "TKF":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TKL&bolum=TURKISH+LANGUAGE+%26+LITERATURE",
    "TKL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=TKL&bolum=TURKISH+LANGUAGE+%26+LITERATURE",
    "AL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
    "AS":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
    "CL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
    "DRA":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
    "EL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
    "ENGL":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
    "FA":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
    "LIT":"https://registration.boun.edu.tr/scripts/sch.asp?donem=2024/2025-2&kisaadi=LL&bolum=WESTERN+LANGUAGES+%26+LITERATURES",
}

// Global browser instance
let browser;

// Initialize browser on server start
async function initBrowser() {
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--window-size=1920,1080',
                '--disable-dev-shm-usage',
                '--ignore-certificate-errors'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            },
            timeout: 60000,
            ignoreHTTPSErrors: true
        });
        console.log('Browser initialized');
        
        // Check if we can connect by opening a test page
        const page = await browser.newPage();
        try {
            await page.goto('https://registration.bogazici.edu.tr', { 
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            console.log('Successfully connected to registration.bogazici.edu.tr');
        } catch (err) {
            console.warn('Could not connect to registration.bogazici.edu.tr, will try alternative domains as needed');
        } finally {
            await page.close();
        }
    } catch (error) {
        console.error('Failed to initialize browser:', error);
    }
}

// Close browser on server shutdown
process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit();
});

// Get departments endpoint
app.get('/api/departments', (req, res) => {
    const departments = Object.keys(url_dict);
    console.log(`Sending ${departments.length} departments to client`);
    res.json(departments);
});

// Get quota data for a specific department
app.get('/api/quota/:deptCode', async (req, res) => {
    try {
        const { deptCode } = req.params;
        
        // Get filtering parameters from query
        const { availability, grade, department, status, quotaType } = req.query;
        
        console.log(`Getting data for ${deptCode}`);
        console.log(`Filters: availability=${availability || 'none'}, grade=${grade || 'none'}, department=${department || 'none'}, status=${status || 'none'}, quotaType=${quotaType || 'none'}`);
        
        // Get raw data from all URLs
        let data = await getData(deptCode);
        
        // Apply filters exactly as in the Python code
        if (availability) {
            data = data.filter(item => item.Availability === availability);
        }
        
        if (grade) {
            // Simply check if the first character of the course number matches the grade
            data = data.filter(item => {
                // Extract the course number part (everything after the department code)
                const courseNum = item.Code.split(' ')[1].split('.')[0];
                return courseNum.charAt(0) === grade;
            });
            console.log(`Filtered by grade ${grade}`);
        }

        if (department && department !== 'No Filter') {
            data = data.filter(item => item.Department === department);
        }

        if (status && status !== 'No Filter') {
            data = data.filter(item => item.Status === status);
        }

        if (quotaType && quotaType !== 'No Filter') {
            if (quotaType === 'consent of instructor') {
                data = data.filter(item => item.Availability === 'Try to get consent');
            } else if (quotaType === 'unlimited') {
                data = data.filter(item => item.Quota.toLowerCase() === 'unlimited');
            }
        }
        
        // Remove duplicates by creating a unique key for each course (Code+Section+Department)
        const uniqueData = [];
        const seen = new Set();
        
        for (const item of data) {
            const key = `${item.Code}|${item.Section}|${item.Department}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueData.push(item);
            }
        }

        // Get available options for filters
        const availableOptions = {
            departments: [...new Set(uniqueData.map(item => item.Department))],
            statuses: [...new Set(uniqueData.map(item => item.Status))]
        };
        
        console.log(`Filtered data contains ${uniqueData.length} unique items`);
        res.json({
            data: uniqueData,
            availableOptions
        });
    } catch (error) {
        console.error('Error getting quota data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Function to get data using Puppeteer - direct access to quotasearch.asp
async function getData(selectedUrl) {
    console.log(`Starting to scrape data for ${selectedUrl}`);
    
    try {
        if (!url_dict[selectedUrl]) {
            throw new Error(`Invalid department code: ${selectedUrl}`);
        }
        
        const urls = Array.isArray(url_dict[selectedUrl]) ? url_dict[selectedUrl] : [url_dict[selectedUrl]];
        console.log(`Department ${selectedUrl} has ${urls.length} URLs to process`);
        
        let allData = [];
        
        // Make sure browser is initialized
        if (!browser) {
            await initBrowser();
        }
        
        // Process each department URL
        for (const url of urls) {
            if (!url) {
                console.log('Skipping empty URL');
                continue;
            }
            
            console.log(`Processing URL: ${url}`);
            
            // Create a main page for this URL
            const page = await browser.newPage();
            page.setDefaultTimeout(30000);
            
            try {
                console.log(`Navigating to department page: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                await page.waitForTimeout(2000);
                
                // Add debug info about page structure and content
                const pageStructure = await page.evaluate(() => {
                    const tables = document.querySelectorAll('table');
                    const links = document.querySelectorAll('a');
                    const patterns = [];
                    const pageText = document.body.textContent;
                    
                    // Look for patterns in links
                    for (const link of links) {
                        const onclick = link.getAttribute('onclick');
                        if (onclick && (onclick.includes('showQuota') || onclick.includes('Info'))) {
                            patterns.push({
                                text: link.textContent.trim(),
                                onclick: onclick
                            });
                        }
                    }
                    
                    // Look for course codes in the page text
                    const courseCodes = [];
                    const regex = /([A-Z]{2,4})\s*(\d{3})\.(\d{2})/g;
                    let match;
                    while ((match = regex.exec(pageText)) !== null) {
                        courseCodes.push(match[0]);
                    }
                    
                    return {
                        tableCount: tables.length,
                        linkCount: links.length,
                        patternSamples: patterns.slice(0, 3),
                        courseCodesFound: courseCodes.slice(0, 3),
                        pageTitle: document.title,
                        hasContent: pageText.length > 100
                    };
                });
                
                console.log(`Page structure debug for ${url}: ${JSON.stringify(pageStructure, null, 2)}`);
                
                // If page appears empty, try to get the raw HTML for debugging
                if (!pageStructure.hasContent) {
                    const html = await page.content();
                    console.log(`Page appears empty. Raw HTML length: ${html.length}`);
                    
                    // Try to extract course codes directly from HTML
                    const htmlContent = await page.evaluate(() => {
                        // Look for any text that might contain course codes
                        const textContent = document.body.textContent;
                        const courseCodes = [];
                        const regex = /([A-Z]{2,4})\s*(\d{3})\.(\d{2})/g;
                        let match;
                        while ((match = regex.exec(textContent)) !== null) {
                            courseCodes.push(match[0]);
                        }
                        
                        // Look for any onclick attributes that might contain course info
                        const onclickPatterns = [];
                        const links = document.querySelectorAll('a');
                        for (const link of links) {
                            const onclick = link.getAttribute('onclick');
                            if (onclick && (onclick.includes('showQuota') || onclick.includes('Info'))) {
                                onclickPatterns.push({
                                    text: link.textContent.trim(),
                                    onclick: onclick
                                });
                            }
                        }
                        
                        return {
                            courseCodes,
                            onclickPatterns,
                            hasLinks: links.length > 0,
                            hasTables: document.querySelectorAll('table').length > 0
                        };
                    });
                    
                    console.log(`HTML content analysis: ${JSON.stringify(htmlContent, null, 2)}`);
                    
                    if (htmlContent.courseCodes.length > 0) {
                        console.log(`Found ${htmlContent.courseCodes.length} course codes in HTML content`);
                        // Add these courses to the results
                        const courses = htmlContent.courseCodes.map(code => {
                            const match = /([A-Z]{2,4})\s*(\d{3})\.(\d{2})/.exec(code);
                            if (match) {
                                return {
                                    deptCode: match[1].trim(),
                                    courseNum: match[2].trim(),
                                    section: match[3].trim(),
                                    fullCode: code
                                };
                            }
                            return null;
                        }).filter(Boolean);
                        
                        console.log(`Extracted ${courses.length} valid courses from HTML content`);
                        return courses;
                    }
                    
                    if (htmlContent.onclickPatterns.length > 0) {
                        console.log(`Found ${htmlContent.onclickPatterns.length} onclick patterns`);
                        // Extract courses from onclick patterns
                        const courses = htmlContent.onclickPatterns.map(pattern => {
                            const match = /showQuota\('([A-Z]{2,4})',\s*'(\d{3})',\s*'(\d{2})'/.exec(pattern.onclick);
                            if (match) {
                                return {
                                    deptCode: match[1].trim(),
                                    courseNum: match[2].trim(),
                                    section: match[3].trim(),
                                    fullCode: `${match[1]} ${match[2]}.${match[3]}`
                                };
                            }
                            return null;
                        }).filter(Boolean);
                        
                        console.log(`Extracted ${courses.length} valid courses from onclick patterns`);
                        return courses;
                    }
                    
                    console.log('No course information found in HTML content, skipping...');
                            continue;
                        }
                
                // Find all course codes on the page
                const courses = await page.evaluate(() => {
                    const results = [];
                    
                    // Method 1: Look for all table rows that might contain course info
                    const rows = Array.from(document.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const cells = Array.from(row.querySelectorAll('td'));
                        if (cells.length < 1) return;
                        
                        // Extract text from the first few cells
                        const cellTexts = cells.slice(0, 4).map(cell => cell.textContent.trim());
                        const fullText = cellTexts.join(' ');
                        
                        // Look for course code pattern (like "TRM 124.01" or "TRM 48M.01")
                        const codeMatch = /([A-Z]{2,4})\s*(\d+[A-Z0-9]*)(?:\.(\d{2}))?/.exec(fullText);
                        if (codeMatch) {
                            // Extract course info
                            const deptCode = codeMatch[1].trim();
                            const courseNum = codeMatch[2].trim();
                            const section = codeMatch[3] ? codeMatch[3].trim() : "01";
                            
                            results.push({
                                deptCode,
                                courseNum,
                                section,
                                fullCode: `${deptCode} ${courseNum}.${section}`
                            });
                        }
                    });
                    
                    // Method 2: Look for quota links directly
                    const allLinks = Array.from(document.querySelectorAll('a'));
                    allLinks.forEach(link => {
                        const onclick = link.getAttribute('onclick');
                        if (onclick && (onclick.includes('showQuota') || onclick.includes('Info'))) {
                            // Extract course information from onclick attribute or parent text
                            let courseText = '';
                            
                            // Try to get course code from onclick attribute
                            if (onclick.includes('quotasearch.asp')) {
                                // Extract directly from quotasearch.asp URL parameters
                                const abbr = /abbr=([^&]+)/.exec(onclick);
                                const code = /code=([^&]+)/.exec(onclick);
                                const section = /section=([^&]+)/.exec(onclick);
                                
                                if (abbr && code) {
                                    const deptCode = abbr[1];
                                    const courseNum = code[1];
                                    const sectionNum = section ? section[1] : "01";
                                    
                                    results.push({
                                        deptCode,
                                        courseNum,
                                        section: sectionNum,
                                        fullCode: `${deptCode} ${courseNum}.${sectionNum}`
                                    });
                                    return;
                                }
                            }
                            
                            // Try to get course code from parent row text
                            let parentRow = link.closest('tr');
                            if (parentRow) {
                                courseText = parentRow.textContent.trim();
                            } else {
                                // Try parent cell
                                let parentCell = link.closest('td');
                                if (parentCell) {
                                    courseText = parentCell.textContent.trim();
                                }
                            }
                            
                            const codeMatch = /([A-Z]{2,4})\s*(\d+[A-Z0-9]*)(?:\.(\d{2}))?/.exec(courseText);
                            if (codeMatch) {
                                const deptCode = codeMatch[1].trim();
                                const courseNum = codeMatch[2].trim();
                                const sectionNum = codeMatch[3] ? codeMatch[3].trim() : "01";
                                
                                results.push({
                                    deptCode,
                                    courseNum,
                                    section: sectionNum,
                                    fullCode: `${deptCode} ${courseNum}.${sectionNum}`
                                });
                            }
                        }
                    });
                    
                    // Method 3: Extract all course codes from page content using regex
                    const bodyText = document.body.textContent;
                    const regex = /([A-Z]{2,4})\s*(\d+[A-Z0-9]*)\.(\d{2})/g;
                    let match;
                    
                    while ((match = regex.exec(bodyText)) !== null) {
                        const deptCode = match[1].trim();
                        const courseNum = match[2].trim();
                        const section = match[3].trim();
                        
                        // Only add courses that match the expected department (from URL)
                        const urlDept = window.location.search.includes('kisaadi=') ? 
                            new URLSearchParams(window.location.search).get('kisaadi') : '';
                        
                        if (!urlDept || deptCode === urlDept) {
                            results.push({
                                deptCode,
                                courseNum, 
                                section,
                                fullCode: `${deptCode} ${courseNum}.${section}`
                            });
                        }
                    }
                    
                    // Remove duplicates by using a Set with fullCode as key
                    const uniqueResults = [];
                    const seen = new Set();
                    
                    for (const course of results) {
                        if (!seen.has(course.fullCode)) {
                            seen.add(course.fullCode);
                            uniqueResults.push(course);
                        }
                    }
                    
                    return uniqueResults;
                });
                
                console.log(`Found ${courses.length} courses to check quotas for in ${url}`);
                
                // Access quota page for each course
                // Process courses in batches of 25 for parallel processing
                const batchSize = 25;
                for (let i = 0; i < courses.length; i += batchSize) {
                    const batch = courses.slice(i, i + batchSize);
                    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(courses.length/batchSize)} (${batch.length} courses)`);
                    
                    // Process each course in the batch in parallel
                    const batchPromises = batch.map(async (course) => {
                        try {
                            const quotaUrl = `https://registration.bogazici.edu.tr/scripts/quotasearch.asp?abbr=${encodeURIComponent(course.deptCode)}&code=${encodeURIComponent(course.courseNum)}&section=${encodeURIComponent(course.section)}&donem=2024/2025-2`;
                            console.log(`Checking quota for ${course.fullCode}`);
                            
                            // Navigate to quota page
                            const quotaPage = await browser.newPage();
                            await quotaPage.goto(quotaUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                            await quotaPage.waitForTimeout(500); // Reduced wait time
                            
                            // Extract quota information
                            const courseData = await quotaPage.evaluate((courseCode) => {
                                // Look for departmental quotas table
                                const tables = Array.from(document.querySelectorAll('table'));
                                let quotaTable = null;
                                
                                // Find the table with "departmental quotas"
                                for (const table of tables) {
                                    if (table.textContent.toLowerCase().includes('departmental quota')) {
                                        quotaTable = table;
                                        break;
                                    }
                                }
                                
                                if (!quotaTable) return [];
                                
                                // Find the actual data rows (skip headers)
                                const rows = Array.from(quotaTable.querySelectorAll('tr'));
                                if (rows.length < 3) return []; // Need at least header row + column headers + data
                                
                                // Parse data from row 2 onwards
                                return rows.slice(2).map(row => {
                                    const cells = Array.from(row.querySelectorAll('td'));
                                    if (cells.length < 4) return null;
                                    
                                    // Extract the text from each cell
                                    let departmentName = cells[0].textContent.trim();
                                    let status = cells[1].textContent.trim();
                                    let quota = cells[2].textContent.trim();
                                    let current = cells[3].textContent.trim();
                                    
                                    // Split course code into parts
                                    const [dept, numSection] = courseCode.split(' ');
                                    const [num, section] = numSection ? numSection.split('.') : ['', '01'];
                                    
                                    return {
                                        Code: `${dept} ${num}.${section}`,
                                        Section: section || '01',
                                        Department: departmentName,
                                        Status: status,
                                        Quota: quota,
                                        'Current Quota': current,
                                    };
                                }).filter(Boolean);
                            }, course.fullCode);
                            
                            // Calculate availability for each course
                            courseData.forEach(row => {
                                if (row.Quota.toLowerCase() === 'unlimited') {
                                    row.Availability = 'Available';
                                } else {
                                    const quota = parseInt(row.Quota);
                                    const currentQuota = parseInt(row['Current Quota']);
                                    
                                    if (!isNaN(quota) && !isNaN(currentQuota)) {
                                        if (currentQuota === quota) {
                                            row.Availability = "Full";
                                        } else if (currentQuota < quota) {
                                            row.Availability = "Available";
                                        } else {
                                            row.Availability = "Try to get consent";
                                        }
                                    } else {
                                        row.Availability = "Available";
                                    }
                                }
                            });
                            
                            // Close the quota page
                            await quotaPage.close();
                            return courseData;
                        } catch (error) {
                            console.error(`Error getting quota for ${course.fullCode}:`, error.message);
                            return [];
                        }
                    });
                    
                    // Wait for all courses in the batch to complete
                    const batchResults = await Promise.all(batchPromises);
                    allData.push(...batchResults.flat());
                }
            } catch (error) {
                console.error(`Error processing department page ${url}:`, error.message);
            } finally {
                // Close the main page for this URL
                await page.close();
            }
        }
        
        console.log(`Processed ${allData.length} quota entries total from all URLs`);
        
        if (allData.length === 0) {
            console.log(`No data found from web scraping for ${selectedUrl}, falling back to CSV`);
            return getDataFromCsv(selectedUrl);
        }
        
        // Return the processed data
        return allData;
    } catch (error) {
        console.error('Error with web scraping:', error.message);
        console.log('Falling back to CSV data');
        return getDataFromCsv(selectedUrl);
    }
}

// Helper function to read from CSV when scraping fails
function getDataFromCsv(deptCode) {
    try {
        let dataPath = path.join(__dirname, '..', '..', 'data1.csv');
        console.log(`Looking for CSV file at: ${dataPath}`);
        
        if (!fs.existsSync(dataPath)) {
            console.log('CSV file not found at default location, checking alternative locations...');
            
            // Try alternative locations
            const alternativePaths = [
                path.join(__dirname, 'data1.csv'),
                path.join(__dirname, '..', 'data1.csv')
            ];
            
            let foundPath = null;
            for (const altPath of alternativePaths) {
                if (fs.existsSync(altPath)) {
                    foundPath = altPath;
                    console.log(`Found CSV at alternative location: ${altPath}`);
                    break;
                }
            }
            
            if (!foundPath) {
                console.log('No CSV file found in any location, returning mock data');
                return getMockData(deptCode);
            }
            
            dataPath = foundPath;
        }
        
        console.log(`Reading from CSV file: ${dataPath}`);
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        
        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        if (records.length === 0) {
            console.log('CSV file was found but contains no records, returning mock data');
            return getMockData(deptCode);
        }
        
        // Filter for the specific department
        let departmentData = records.filter(row => 
            row.Code && row.Code.startsWith(deptCode)
        );
        
        // If no data found for the department, try a more lenient search (in case of spacing differences)
        if (departmentData.length === 0) {
            console.log(`No exact matches found for ${deptCode}, trying lenient search`);
            departmentData = records.filter(row => 
                row.Code && (
                    row.Code.startsWith(deptCode) ||
                    row.Code.startsWith(deptCode + ' ') ||
                    row.Code.replace(/\s+/g, '').startsWith(deptCode)
                )
            );
        }
        
        console.log(`Found ${departmentData.length} entries for ${deptCode} in CSV`);
        
        if (departmentData.length === 0) {
            return getMockData(deptCode);
        }
        
        return departmentData;
    } catch (error) {
        console.error('Error reading CSV data:', error.message);
        return getMockData(deptCode);
    }
}

// Function to provide mock data when all else fails
function getMockData(deptCode) {
    console.log(`Generating mock data for ${deptCode}`);
    
    // Create some realistic-looking mock data
    const mockCourses = [];
    const levels = ['1', '2', '3', '4'];
    const sections = ['01', '02', '03'];
    const statuses = ['UNDERGRADUATE', 'ALL'];
    const availabilityOptions = ['Available', 'Full', 'Try to get consent'];
    
    // Generate 10-15 mock courses
    const numCourses = Math.floor(Math.random() * 6) + 10;
    
    for (let i = 0; i < numCourses; i++) {
        const level = levels[Math.floor(Math.random() * levels.length)];
        const courseNum = level + (Math.floor(Math.random() * 9) + 1).toString().padStart(2, '0');
        const section = sections[Math.floor(Math.random() * sections.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const quota = Math.floor(Math.random() * 50) + 20;
        const currentQuota = Math.floor(Math.random() * (quota + 10));
        
        let availability;
        if (currentQuota === quota) {
            availability = 'Full';
        } else if (currentQuota < quota) {
            availability = 'Available';
        } else {
            availability = 'Try to get consent';
        }
        
        mockCourses.push({
            Code: `${deptCode} ${courseNum}.${section}`,
            Department: 'ALL',
            Status: status,
            Quota: quota.toString(),
            'Current Quota': currentQuota.toString(),
            Availability: availability
        });
    }
    
    return mockCourses;
}

// Start the server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initBrowser();
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
} 