import { getStore } from "@netlify/blobs";

// One-time restore of Aug–Dec 2026 to match SU-Calendar-2.pdf (exported 19 Oct 2026).
// Runs once on the first request after deploy. Before changing anything it saves a full
// backup of the current events under "events-backup-before-pdf-restore", so nothing is lost.
// Events outside Aug–Dec 2026 (e.g. anything added for 2027) are kept as they are.
const RESTORE_FLAG = "restore-pdf-2026-10-19-done";
const RANGE_START = "2026-08-01";
const RANGE_END = "2026-12-31";
const PDF_EVENTS = [
  {"id": "p1", "title": "Kingdom Kintsugi Workshop (10am–1pm)", "category": "ministry", "start": "2026-08-01", "end": "2026-08-01", "time": "10am–1pm", "location": "Waterloo Street"},
  {"id": "p2", "title": "Staff Meeting - All", "category": "meetings", "start": "2026-08-03", "end": "2026-08-03", "time": "2:30pm - 5pm", "location": ""},
  {"id": "p3", "title": "Devotion, Devo: Basil & Worship: Lilis", "category": "meetings", "start": "2026-08-03", "end": "2026-08-03", "time": "", "location": ""},
  {"id": "p4", "title": "Staff Retreat (3D2N)", "category": "camps", "start": "2026-08-05", "end": "2026-08-07", "time": "", "location": "Villa @ JB"},
  {"id": "p5", "title": "SU Staff Devotion - Devo: Luke & Worship: Christine", "category": "meetings", "start": "2026-08-11", "end": "2026-08-11", "time": "1:30pm - 2.30pm", "location": ""},
  {"id": "p6", "title": "Staff Meeting - All", "category": "meetings", "start": "2026-08-11", "end": "2026-08-11", "time": "2:30pm - 5pm", "location": ""},
  {"id": "p7", "title": "SUPA Kids Programme (4pm–5:30pm)", "category": "ministry", "start": "2026-08-12", "end": "2026-08-12", "time": "4pm–5:30pm", "location": "Ahavah Student Centre"},
  {"id": "p8", "title": "Luke: OIL", "category": "leave", "start": "2026-08-12", "end": "2026-08-12", "time": "", "location": ""},
  {"id": "p9", "title": "Christine: OIL (PM)", "category": "leave", "start": "2026-08-12", "end": "2026-08-12", "time": "1pm-6pm", "location": ""},
  {"id": "p10", "title": "ITE West - Calvin, Michael, Fuji, Luke", "category": "ministry", "start": "2026-08-12", "end": "2026-08-12", "time": "4pm-7pm", "location": ""},
  {"id": "p11", "title": "ITE Central- Calvin, Michael, Jeremy (11am - 2pm)", "category": "ministry", "start": "2026-08-13", "end": "2026-08-13", "time": "11am-2pm", "location": ""},
  {"id": "p12", "title": "My Student Care Centre- All Ministry Staff (4pm-6pm)", "category": "ministry", "start": "2026-08-14", "end": "2026-08-14", "time": "4pm–6pm", "location": "@ Bartley"},
  {"id": "p13", "title": "Yu Ming: Annual Leave", "category": "leave", "start": "2026-08-14", "end": "2026-08-14", "time": "", "location": ""},
  {"id": "p14", "title": "We Can Programme - Luke, Jeremy, Michael (2pm-4pm)", "category": "ministry", "start": "2026-08-14", "end": "2026-08-14", "time": "2pm - 4pm", "location": ""},
  {"id": "p15", "title": "Basil: OIL", "category": "leave", "start": "2026-08-14", "end": "2026-08-14", "time": "", "location": ""},
  {"id": "p16", "title": "Fuji: OIL", "category": "leave", "start": "2026-08-14", "end": "2026-08-14", "time": "", "location": ""},
  {"id": "p17", "title": "ISCF booth - Basil & Jeremy (2pm-5pm)", "category": "ministry", "start": "2026-08-15", "end": "2026-08-15", "time": "2pm-5pm", "location": ""},
  {"id": "p18", "title": "Missions Sunday (9:30am–11:30am)", "category": "ministry", "start": "2026-08-16", "end": "2026-08-16", "time": "9:30am–11:30am", "location": "Bethel Presbyterian Church"},
  {"id": "p19", "title": "Young Adult Bible Study (7:30pm)", "category": "training", "start": "2026-08-17", "end": "2026-08-17", "time": "7:30pm", "location": "SU Office"},
  {"id": "p20", "title": "Sammi: AL", "category": "leave", "start": "2026-08-17", "end": "2026-08-17", "time": "", "location": ""},
  {"id": "p21", "title": "Jeremy: OIL (AM)", "category": "leave", "start": "2026-08-17", "end": "2026-08-17", "time": "", "location": ""},
  {"id": "p22", "title": "Audrey: OIL (AM)", "category": "leave", "start": "2026-08-17", "end": "2026-08-17", "time": "", "location": ""},
  {"id": "p23", "title": "Basil: OIL", "category": "leave", "start": "2026-08-17", "end": "2026-08-17", "time": "", "location": ""},
  {"id": "p24", "title": "SU Staff Devotion - Devo: Yu Ming & Worship: Gillian", "category": "meetings", "start": "2026-08-17", "end": "2026-08-17", "time": "1.30pm - 2.30pm", "location": ""},
  {"id": "p25", "title": "Staff Meeting - All", "category": "meetings", "start": "2026-08-17", "end": "2026-08-17", "time": "2.30pm - 5pm", "location": ""},
  {"id": "p26", "title": "ITE East - Calvin, Michael", "category": "ministry", "start": "2026-08-18", "end": "2026-08-18", "time": "3.30pm - 5pm", "location": ""},
  {"id": "p27", "title": "Sammi: AL", "category": "leave", "start": "2026-08-18", "end": "2026-08-18", "time": "", "location": ""},
  {"id": "p28", "title": "Prophetic Art painting for Staff (10am)", "category": "training", "start": "2026-08-19", "end": "2026-08-19", "time": "10am", "location": "SU Office"},
  {"id": "p29", "title": "Ruth: OIL (PM)", "category": "leave", "start": "2026-08-19", "end": "2026-08-19", "time": "1pm-6pm", "location": ""},
  {"id": "p30", "title": "ITE West - Calvin, Michael, Fuji, Luke, Audrey", "category": "ministry", "start": "2026-08-19", "end": "2026-08-19", "time": "4pm - 7pm", "location": ""},
  {"id": "p31", "title": "Brave Conference Committee Meeting", "category": "ministry", "start": "2026-08-19", "end": "2026-08-19", "time": "8pm - 10pm", "location": ""},
  {"id": "p32", "title": "ITE Central- Calvin, Michael, Jeremy (11am - 2pm)", "category": "ministry", "start": "2026-08-20", "end": "2026-08-20", "time": "11am - 2pm", "location": ""},
  {"id": "p33", "title": "Sammi: AL", "category": "leave", "start": "2026-08-20", "end": "2026-08-20", "time": "", "location": ""},
  {"id": "p34", "title": "We Can Programme - Luke, Jeremy, Michael (2pm-4pm)", "category": "ministry", "start": "2026-08-21", "end": "2026-08-21", "time": "", "location": ""},
  {"id": "p35", "title": "Calvin: CLL", "category": "leave", "start": "2026-08-21", "end": "2026-08-21", "time": "", "location": ""},
  {"id": "p36", "title": "Sammi: AL", "category": "leave", "start": "2026-08-21", "end": "2026-08-21", "time": "", "location": ""},
  {"id": "p37", "title": "Youth Ministry Observation (Ebenezer EFC) - Luke", "category": "ministry", "start": "2026-08-22", "end": "2026-08-22", "time": "5:30pm - 7:00pm", "location": ""},
  {"id": "p38", "title": "Youth Ministry Meeting with Church of the Epiphany (English) - Luke", "category": "ministry", "start": "2026-08-22", "end": "2026-08-22", "time": "10am - 12pm", "location": ""},
  {"id": "p39", "title": "EDMs to be completed", "category": "deadlines", "start": "2026-08-24", "end": "2026-08-24", "time": "", "location": ""},
  {"id": "p40", "title": "SU Staff Devotion - Devo: Calvin & Worship:", "category": "meetings", "start": "2026-08-24", "end": "2026-08-24", "time": "1.30pm - 2.30pm", "location": ""},
  {"id": "p41", "title": "Staff Meeting - All", "category": "meetings", "start": "2026-08-24", "end": "2026-08-24", "time": "2.30pm - 5pm", "location": ""},
  {"id": "p42", "title": "ITE East - Calvin, Michael", "category": "ministry", "start": "2026-08-25", "end": "2026-08-25", "time": "3.30pm - 5pm", "location": ""},
  {"id": "p43", "title": "SU Council Meeting", "category": "meetings", "start": "2026-08-25", "end": "2026-08-25", "time": "7pm - 10pm", "location": ""},
  {"id": "p44", "title": "Sammi - Bethany Emmanuel Church", "category": "meetings", "start": "2026-08-25", "end": "2026-08-25", "time": "8.30pm", "location": ""},
  {"id": "p45", "title": "CM meeting - Krystal, Audrey, Jeremy, Jason, Michael", "category": "meetings", "start": "2026-08-25", "end": "2026-08-25", "time": "11am - 12nn, 1.30-2.30pm", "location": ""},
  {"id": "p46", "title": "Prayer Meeting (tentative) 11am", "category": "meetings", "start": "2026-08-26", "end": "2026-08-26", "time": "11am", "location": ""},
  {"id": "p47", "title": "ITE West - Calvin, Michael, Fuji, Luke, Audrey", "category": "ministry", "start": "2026-08-26", "end": "2026-08-26", "time": "4pm - 5.30pm", "location": ""},
  {"id": "p48", "title": "ITE Central - Calvin, Michael, Jeremy", "category": "ministry", "start": "2026-08-27", "end": "2026-08-27", "time": "11am - 2pm", "location": ""},
  {"id": "p49", "title": "EDMs to be sent out", "category": "deadlines", "start": "2026-08-28", "end": "2026-08-28", "time": "", "location": ""},
  {"id": "p50", "title": "We Can Programme (Outdoor Adventure) - All Ministry Staff", "category": "ministry", "start": "2026-08-28", "end": "2026-08-28", "time": "2pm-5pm", "location": ""},
  {"id": "p51", "title": "SU Staff Devotion - Devo:Jason & Worship:Luke", "category": "meetings", "start": "2026-08-31", "end": "2026-08-31", "time": "1.30pm - 2.30pm", "location": ""},
  {"id": "p52", "title": "Staff Meeting - All", "category": "meetings", "start": "2026-08-31", "end": "2026-08-31", "time": "2.30pm - 5pm", "location": ""},
  {"id": "p53", "title": "Fuji: AL", "category": "leave", "start": "2026-08-31", "end": "2026-09-08", "time": "", "location": ""},
  {"id": "p54", "title": "ITE East - Calvin, Michael", "category": "ministry", "start": "2026-09-01", "end": "2026-09-01", "time": "3:30pm - 5pm", "location": ""},
  {"id": "p55", "title": "Audrey, Jeremy, Krystal, Sammi : SUPA Kids Programme (4pm–5:30pm)", "category": "ministry", "start": "2026-09-02", "end": "2026-09-02", "time": "4pm–5:30pm", "location": "Ahavah Student Centre"},
  {"id": "p56", "title": "ITE West - Calvin, Michael, Luke", "category": "ministry", "start": "2026-09-02", "end": "2026-09-02", "time": "4:30pm - 6:30pm", "location": ""},
  {"id": "p57", "title": "Thanksgiving registration send out(Email-Basil)", "category": "deadlines", "start": "2026-09-02", "end": "2026-09-02", "time": "", "location": ""},
  {"id": "p58", "title": "ITE Central - Calvin, Michael, Jeremy", "category": "ministry", "start": "2026-09-03", "end": "2026-09-03", "time": "12pm - 2pm", "location": ""},
  {"id": "p59", "title": "Sammi: AL", "category": "leave", "start": "2026-09-04", "end": "2026-09-04", "time": "", "location": ""},
  {"id": "p60", "title": "Michael, Jeremy, Krystal, Sammi: Bethany Emmanuel Church Day Camp (HTP)", "category": "camps", "start": "2026-09-05", "end": "2026-09-05", "time": "9am–5pm", "location": ""},
  {"id": "p61", "title": "YA Bible Study", "category": "ministry", "start": "2026-09-07", "end": "2026-09-07", "time": "7pm-9.30pm", "location": ""},
  {"id": "p62", "title": "Luke: AL", "category": "leave", "start": "2026-09-07", "end": "2026-09-09", "time": "", "location": ""},
  {"id": "p63", "title": "ITE East - Calvin, Michael", "category": "ministry", "start": "2026-09-08", "end": "2026-09-08", "time": "3:30pm - 5pm", "location": ""},
  {"id": "p64", "title": "Sammi, Krystal - Grace SCC", "category": "meetings", "start": "2026-09-08", "end": "2026-09-08", "time": "8.30pm", "location": ""},
  {"id": "p65", "title": "Psychology First Aid (PFA) training", "category": "training", "start": "2026-09-08", "end": "2026-09-08", "time": "10am - 5pm", "location": ""},
  {"id": "p66", "title": "ITE West - Calvin, Michael, Fuji, Audrey", "category": "ministry", "start": "2026-09-09", "end": "2026-09-09", "time": "4:30pm - 6:30pm", "location": ""},
  {"id": "p67", "title": "Luke: AL", "category": "leave", "start": "2026-09-11", "end": "2026-09-11", "time": "", "location": ""},
  {"id": "p68", "title": "Youth Ministry Observation (Ebenezer EFC) - Luke", "category": "ministry", "start": "2026-09-12", "end": "2026-09-12", "time": "5:30pm - 7pm", "location": ""},
  {"id": "p69", "title": "Grace AOG Children & Youth Missions", "category": "ministry", "start": "2026-09-13", "end": "2026-09-13", "time": "8:45am - 10:15am & 11am - 12:30pm", "location": "2 locations"},
  {"id": "p70", "title": "East West Asia Community Support Gathering (4D3N)", "category": "camps", "start": "2026-09-14", "end": "2026-09-18", "time": "", "location": "Bangkok"},
  {"id": "p71", "title": "ITE East - Calvin, Michael", "category": "ministry", "start": "2026-09-15", "end": "2026-09-15", "time": "3:30pm - 5pm", "location": ""},
  {"id": "p72", "title": "Ruth: Annual Leave", "category": "leave", "start": "2026-09-16", "end": "2026-09-16", "time": "", "location": ""},
  {"id": "p73", "title": "ITE West - Calvin, Michael, Luke, Fuji, Audrey", "category": "ministry", "start": "2026-09-16", "end": "2026-09-16", "time": "4:30pm - 6pm", "location": ""},
  {"id": "p74", "title": "Thanksgiving registration send out(Email-Basil)", "category": "deadlines", "start": "2026-09-16", "end": "2026-09-16", "time": "", "location": ""},
  {"id": "p75", "title": "ITE Central - Calvin, Michael, Jeremy", "category": "ministry", "start": "2026-09-17", "end": "2026-09-17", "time": "12pm - 2pm", "location": ""},
  {"id": "p76", "title": "Audrey, Krystal, Jeremy, Michael, Calvin, Luke, Sammi: My Student Care Centre (4pm–6pm)", "category": "ministry", "start": "2026-09-18", "end": "2026-09-18", "time": "4pm–6pm", "location": ""},
  {"id": "p77", "title": "Budget submission deadline", "category": "deadlines", "start": "2026-09-18", "end": "2026-09-18", "time": "", "location": ""},
  {"id": "p78", "title": "We Can Programme session (2pm-4pm)", "category": "ministry", "start": "2026-09-18", "end": "2026-09-18", "time": "", "location": ""},
  {"id": "p79", "title": "Ruth: Annual Leave", "category": "leave", "start": "2026-09-21", "end": "2026-09-22", "time": "", "location": ""},
  {"id": "p80", "title": "Walk Thru the Bible | otLIVE kids", "category": "training", "start": "2026-09-22", "end": "2026-09-23", "time": "", "location": ""},
  {"id": "p81", "title": "Walk Thru the Bible | otLIVE stories", "category": "training", "start": "2026-09-24", "end": "2026-09-24", "time": "10am–5pm", "location": ""},
  {"id": "p82", "title": "Luke: OIL", "category": "leave", "start": "2026-09-25", "end": "2026-09-25", "time": "", "location": ""},
  {"id": "p83", "title": "Audrey: AL", "category": "leave", "start": "2026-09-28", "end": "2026-09-29", "time": "", "location": ""},
  {"id": "p84", "title": "ITE East - Calvin, Michael", "category": "ministry", "start": "2026-09-29", "end": "2026-09-29", "time": "3:30pm - 5pm", "location": ""},
  {"id": "p85", "title": "ITE West - Calvin, Michael, Luke, Fuji, Audrey", "category": "ministry", "start": "2026-09-30", "end": "2026-09-30", "time": "4:30pm - 6:30pm", "location": ""},
  {"id": "p86", "title": "End registration for SUPA Camp", "category": "deadlines", "start": "2026-09-30", "end": "2026-09-30", "time": "", "location": ""},
  {"id": "p87", "title": "Krystal: OIL", "category": "leave", "start": "2026-09-30", "end": "2026-09-30", "time": "", "location": ""},
  {"id": "p88", "title": "Basil AL", "category": "leave", "start": "2026-10-01", "end": "2026-10-01", "time": "", "location": ""},
  {"id": "p89", "title": "Yu Ming (AL)", "category": "leave", "start": "2026-10-02", "end": "2026-10-02", "time": "", "location": ""},
  {"id": "p90", "title": "Basil AL", "category": "leave", "start": "2026-10-02", "end": "2026-10-02", "time": "", "location": ""},
  {"id": "p91", "title": "Children's Day @ Blessed Grace (2pm-4pm)", "category": "ministry", "start": "2026-10-04", "end": "2026-10-04", "time": "2–4pm", "location": ""},
  {"id": "p92", "title": "Basil reservist", "category": "leave", "start": "2026-10-12", "end": "2026-10-21", "time": "", "location": ""},
  {"id": "p93", "title": "Christine: Annual Leave", "category": "leave", "start": "2026-10-05", "end": "2026-10-12", "time": "", "location": ""},
  {"id": "p94", "title": "SUPA Kids Programme (4pm–5:30pm)", "category": "ministry", "start": "2026-10-07", "end": "2026-10-07", "time": "4pm–5:30pm", "location": "Ahavah Student Centre"},
  {"id": "p95", "title": "Psychological First Aid for Children Course (10am -5pm)", "category": "training", "start": "2026-10-08", "end": "2026-10-08", "time": "10am–5pm", "location": ""},
  {"id": "p96", "title": "We Can Programme session (2pm-4pm)", "category": "ministry", "start": "2026-10-09", "end": "2026-10-09", "time": "2pm-4pm", "location": ""},
  {"id": "p97", "title": "Luke, Jeremy, Krystal: Yishun Christian Church, Children's Day Evangelism Outreach", "category": "ministry", "start": "2026-10-10", "end": "2026-10-10", "time": "1pm–4pm", "location": ""},
  {"id": "p98", "title": "Michael, Krystal: BPMC Children's Day", "category": "ministry", "start": "2026-10-11", "end": "2026-10-11", "time": "2–4pm", "location": "Bukit Panjang Methodist Church"},
  {"id": "p99", "title": "Luke: OIL (AM)", "category": "leave", "start": "2026-10-12", "end": "2026-10-12", "time": "9am - 12pm", "location": ""},
  {"id": "p100", "title": "Calvin: (PM)", "category": "leave", "start": "2026-10-12", "end": "2026-10-12", "time": "1pm - 5pm", "location": ""},
  {"id": "p101", "title": "Sammi: OIL", "category": "leave", "start": "2026-10-12", "end": "2026-10-12", "time": "", "location": ""},
  {"id": "p102", "title": "Jeremy: OIL (AM)", "category": "leave", "start": "2026-10-12", "end": "2026-10-12", "time": "9am - 1pm", "location": ""},
  {"id": "p103", "title": "Sammi: OIL", "category": "leave", "start": "2026-10-13", "end": "2026-10-13", "time": "", "location": ""},
  {"id": "p104", "title": "Christine: OIL", "category": "leave", "start": "2026-10-13", "end": "2026-10-13", "time": "", "location": ""},
  {"id": "p105", "title": "Remind RSVP Guest for Thanksgiving \"One week away\" (Email-Basil)", "category": "deadlines", "start": "2026-10-14", "end": "2026-10-14", "time": "", "location": ""},
  {"id": "p106", "title": "Sammi: Annual Leave", "category": "leave", "start": "2026-10-14", "end": "2026-10-14", "time": "", "location": ""},
  {"id": "p107", "title": "Luke: OIL (PM)", "category": "leave", "start": "2026-10-15", "end": "2026-10-15", "time": "", "location": ""},
  {"id": "p108", "title": "Sammi: Annual Leave", "category": "leave", "start": "2026-10-15", "end": "2026-10-15", "time": "", "location": ""},
  {"id": "p109", "title": "We Can Programme session (2pm-4pm)", "category": "ministry", "start": "2026-10-16", "end": "2026-10-16", "time": "2pm-4pm", "location": ""},
  {"id": "p110", "title": "Walk Thru the Bible @ Church of The Epiphany", "category": "ministry", "start": "2026-10-16", "end": "2026-10-16", "time": "7.30 pm - 9.30 pm", "location": ""},
  {"id": "p111", "title": "otLIVE Train the trainer @ Church of the Epiphany", "category": "ministry", "start": "2026-10-17", "end": "2026-10-17", "time": "10am - 5pm", "location": ""},
  {"id": "p112", "title": "IBC Children's Programme (9am–12pm)", "category": "ministry", "start": "2026-10-18", "end": "2026-10-18", "time": "9am–12pm", "location": "HTP – Agape"},
  {"id": "p113", "title": "Christine: Annual Leave", "category": "leave", "start": "2026-10-21", "end": "2026-10-24", "time": "", "location": ""},
  {"id": "p114", "title": "Thanksgiving Dinner cum CPCM/BYMT Graduation (6:30pm-9.30pm)", "category": "ministry", "start": "2026-10-22", "end": "2026-10-22", "time": "6:30pm-9.30pm", "location": "Bible House Rooftop"},
  {"id": "p115", "title": "Youth Pastor Sharing - Fuji", "category": "ministry", "start": "2026-10-22", "end": "2026-10-22", "time": "10am - 12pm", "location": ""},
  {"id": "p116", "title": "Basil AL", "category": "leave", "start": "2026-10-23", "end": "2026-10-23", "time": "", "location": ""},
  {"id": "p117", "title": "Faith MC Outreach Day Camp for Children", "category": "camps", "start": "2026-10-24", "end": "2026-10-24", "time": "9am–5pm", "location": "Faith Methodist Church"},
  {"id": "p118", "title": "Jeremy: OIL", "category": "leave", "start": "2026-10-26", "end": "2026-10-26", "time": "", "location": ""},
  {"id": "p119", "title": "Basil 0.5 AL + 0.5 OIL", "category": "leave", "start": "2026-10-26", "end": "2026-10-26", "time": "", "location": ""},
  {"id": "p120", "title": "Discipleship Training West Malaysia (6D5N) - Christine & Sammi", "category": "camps", "start": "2026-10-26", "end": "2026-10-31", "time": "", "location": ""},
  {"id": "p121", "title": "Council to Approve Budget 2027", "category": "deadlines", "start": "2026-10-28", "end": "2026-10-28", "time": "", "location": ""},
  {"id": "p122", "title": "We Can Programme session (2pm-4pm)", "category": "ministry", "start": "2026-10-30", "end": "2026-10-30", "time": "2pm-4pm", "location": ""},
  {"id": "p123", "title": "SUPA Kids Programme (4pm–5:30pm)", "category": "ministry", "start": "2026-11-04", "end": "2026-11-04", "time": "4pm–5:30pm", "location": "Ahavah Student Centre"},
  {"id": "p124", "title": "St Francis Methodist School (8am–2:30pm)", "category": "ministry", "start": "2026-11-06", "end": "2026-11-06", "time": "8am–2:30pm", "location": ""},
  {"id": "p125", "title": "Basil AL", "category": "leave", "start": "2026-11-06", "end": "2026-11-06", "time": "", "location": ""},
  {"id": "p126", "title": "Community Support Leadership Meet", "category": "camps", "start": "2026-11-10", "end": "2026-11-14", "time": "", "location": ""},
  {"id": "p127", "title": "Gillian: Annual Leave", "category": "leave", "start": "2026-11-10", "end": "2026-11-16", "time": "", "location": ""},
  {"id": "p128", "title": "Basl AL", "category": "leave", "start": "2026-11-10", "end": "2026-11-11", "time": "", "location": ""},
  {"id": "p129", "title": "St Francis Methodist School (8am–2:30pm)", "category": "ministry", "start": "2026-11-13", "end": "2026-11-13", "time": "8am–2:30pm", "location": ""},
  {"id": "p130", "title": "Youth Camp Speaking (Bukit Batok Presbyterian Church) - Luke", "category": "ministry", "start": "2026-11-13", "end": "2026-11-15", "time": "", "location": ""},
  {"id": "p131", "title": "St. George's Church - HTP (3D)", "category": "camps", "start": "2026-11-20", "end": "2026-11-22", "time": "", "location": "JB, Forest City"},
  {"id": "p132", "title": "SUPA Camp Briefing (10am–3pm)", "category": "ministry", "start": "2026-11-21", "end": "2026-11-21", "time": "10am–3pm", "location": "SU Office"},
  {"id": "p133", "title": "Grace SCC Disciple Program (9am–12pm)", "category": "ministry", "start": "2026-11-22", "end": "2026-11-22", "time": "9am–12pm", "location": ""},
  {"id": "p134", "title": "SUPA Camp 2026 (3D2N)", "category": "camps", "start": "2026-11-26", "end": "2026-11-28", "time": "", "location": "Kampung Siglap"},
  {"id": "p135", "title": "Gen Brave Conference | FOP X (9am–4pm)", "category": "training", "start": "2026-12-01", "end": "2026-12-03", "time": "9am–4pm", "location": "Cornerstone Church"},
  {"id": "p136", "title": "SU Youth Camp 2026 (3D2N)", "category": "camps", "start": "2026-12-06", "end": "2026-12-08", "time": "", "location": "CPT"},
  {"id": "p137", "title": "Ahavah Camp-HTP (3D)", "category": "camps", "start": "2026-12-15", "end": "2026-12-17", "time": "", "location": "Volunteers' outreach 17 Dec PM"},
  {"id": "p138", "title": "Christmas Grace Assembly of God (8:45am & 11am)", "category": "ministry", "start": "2026-12-20", "end": "2026-12-20", "time": "8:45am & 11am", "location": ""},
  {"id": "p139", "title": "Christine: Annual Leave", "category": "leave", "start": "2026-12-21", "end": "2026-12-24", "time": "", "location": ""},
  {"id": "p140", "title": "Christmas Yio Chu Kang Chapel (10:30am–12:30pm)", "category": "ministry", "start": "2026-12-25", "end": "2026-12-25", "time": "10:30am–12:30pm", "location": ""},
  {"id": "p141", "title": "Christmas International Baptist Church", "category": "ministry", "start": "2026-12-27", "end": "2026-12-27", "time": "", "location": ""},
];

async function restoreOnce(store) {
  const done = await store.get(RESTORE_FLAG);
  if (done) return;

  const current = (await store.get("events", { type: "json" })) || [];
  await store.setJSON("events-backup-before-pdf-restore", {
    savedAt: new Date().toISOString(),
    events: current,
  });

  const inRange = (e) => e.end >= RANGE_START && e.start <= RANGE_END;
  const used = new Set();
  // keep the existing id/location for an event that matches by title + start date
  const restored = PDF_EVENTS.map((p) => {
    const match = current.find(
      (c) => !used.has(c.id) && c.title === p.title && c.start === p.start && inRange(c)
    );
    if (match) {
      used.add(match.id);
      return { ...p, id: match.id, location: match.location || p.location || "" };
    }
    return { ...p };
  });
  const outside = current.filter((e) => e && e.start && !inRange(e));
  await store.setJSON("events", restored.concat(outside));

  const history = (await store.get("history", { type: "json" })) || [];
  history.push({
    id: "h" + Date.now() + "restore",
    action: "restored",
    by: "System",
    at: new Date().toISOString(),
    note: "Aug–Dec 2026 restored to match SU-Calendar-2.pdf. Previous data backed up.",
  });
  await store.setJSON("history", history);
  await store.set(RESTORE_FLAG, new Date().toISOString());
}

export default async (req) => {
  const store = getStore("su-calendar");

  try {
    await restoreOnce(store);
  } catch (e) {
    console.error("PDF restore failed", e);
  }

  if (req.method === "GET") {
    const data = await store.get("events", { type: "json" });
    return new Response(JSON.stringify(data || []), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "Expected an array of events" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await store.setJSON("events", body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
