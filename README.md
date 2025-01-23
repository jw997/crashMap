The goal of this project is to make police collsion data for Berkeley accessible.

Collision data originates with police colllision reports.

For Berkeley there currently are 2 governmental sources of crash data:
The Berkeley Police Transparency Portal, and the Statewide Integrated Traffic Reporting Sysystem (SWITRS).

SWITRS is used across California and has existed for 15 years or more. It accepts reports from CHP, BPD and other police departments.  UCPD does not appear to participate.
https://iswitrs.chp.ca.gov/Reports/jsp/index.jsp

The Berkeley Police Transparency Portal (TP) is a new-ish system, unique to Berkeley.
https://bpd-transparency-initiative-berkeleypd.hub.arcgis.com/pages/traffic-safety

They each have some shortcomings and benefits for understanding traffic collisions in Berkeley.

AFAIK there is no other publicly available source of crash data for Berkeley.

There is a website called the Transportation Information Management System (TIMS) that collects injury crash information from SWITRS and provides it free to the public through their web interface at https://tims.berkeley.edu/. TIMS has a pretty good search interface and mapping and export features.

SWITRS acquires quite a bit of information about each collision -- date, time, weather, lighting, vehicle types, make models, streets, gps coordinates, age/gender/race and role of parties and victims, laws violated, and parties at fault.

TP is a much smaller set of information.

The basic life of a collision report is 
1) Collision happens
2) If police are called and there is an injury or enough property damage, they write a report. In Berkeley, it could be BPD, CHP, or UCPD. 
3) Report is posted to the TP if it comes from BPD.
4) Report is forwarded to SWITRS, if it comes from BPD or CHP.  After some delay, which varies from a few weeks to a year, it appears in the SWITRS database.
5) TIMS gets reports from SWITRS and a bit later it shows up in the TIMS data, if there was an injury reported.

Shortcomings
All of these require the collision to be reported. Many collisions are not reported, and hence all the data are undercounts.

1) TP is the quickest to update, but still has a dealy of several weeks. TP has the least detailed info.

2) Some information about vehicle type is lost on the way from BPD to SWITRS. For example, the identification of electric bikes, electric scooters, and electric skateboards is often different between TP and SWITRS.  SWITRS shows 7 ebike crashes but TP shows 34.  Spot checking shows some of those crashes in SWITRS appears as non electric bicycle crashes, whereas TP shows them as ebikes.

3) SWITRS is often months behind the current date.

4) TP lacks injury severity info for crashes before 2023, instead showing 'unspecified injury'

5) TIMS lacks info about non-injury crashes.

6) TIMS requires an account.

7) SWITRS requires an account, and its web interface has been offline for several months.  Currently you must email a data request and wait one week for a manual reply. 

8) SWITRS using a confusing collection of single letter and number codes documented in the SWITRS handbook.  

8) TP has no documented data download method.  Data for this project was downloaded using this type of arcgis query -- 

https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/cleaned_traffic_data/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=true&outFields=*&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(DateTime>=timestamp %272018-01-01 00:00:00%27AND DateTime<timestamp %272019-01-01 00:00:00%27)'

9) many SWITRS records have missing GPS data

10) some SWITRS records have missing local case id data

11) there appear to be typos in the transcription of time and local case id info between BPD
Some collisions that show up in TP are completely missing from SWITRS for reasons unknown.
Example -- https://www.berkeleyside.org/2016/01/12/berkeley-city-worker-dies-in-garbage-truck-accident is found in TP but not in SWITRS.

Some collisions that are in both places have typos in the time fields giving different times in SWITRS and TP.

12) The location fields differ between TP and SWITRS. SWITRS has primary_road, secondary_road, intersection, direction, distance and gps.  TP just has a location field, which has the names of the 2 intersecting roads, and gps coordinates.  In some cases, crashes which appear to have happened mid block are reported by TP at the intersection.  Example: this crash is shown on the tp as at the intersection

Case ID: 8168978
Year: 2016
Severity: Fatal
Pedestrian: Y
Crash Location
Primary: UNIVERSITY AV
Secondary: SHATTUCK AV
Intersection: N
Offset Distance: 312.00
Offset Direction: W

13) UCPD does not appear to upload data to SWITRS at all.  There are even fatal collsions on UC campus that do not appear.  For example:
https://www.dailycal.org/archives/uc-berkeley-student-dies-after-motorcycle-accident-on-campus/article_dae3c408-c4bc-5cd9-b8fa-2efae00d9918.html


14) Some cases in TP are missing from SWITRS, such as this fatal crash
Date: 2021-06-14
Time: 21:36:00
Case_Number: 2021-00026351
Accident_Location: Ashby Avenue / Telegraph Avenue
Latitude: 37.85511660709627
Longitude: -122.26036462790414
Collision_Classification_Descri: Other
Collision_Type: Pedestrian
Primary_Collision_Factor_Code: 22350
PCF_Description: VC 22350: Unsafe speed for prevailing conditions
Involved_Objects: 1 Car, 1 Pedestrian
Involved_Parties: Driver/Pedestrian
Party_at_Fault: Driver
Number_of_Fatalities: 1
Injury_Severity: Fatal

or 
https://www.berkeleyside.org/2021/07/19/berkeley-police-vehicle-pedestrian-hit
Date: 2021-07-14
Time: 16:26:00
Case_Number: 2021-00031430
Accident_Location: Allston Way / Sacramento Street
Latitude: 37.867393619160524
Longitude: -122.28163857056302

SWITRS downloads recently added a "local case id" field which may help identify correspon

15) the injury severity is a judgement on the scene from the police.  If the victim dies later, the crash is still not marked as fatal.  Exampled -- https://www.berkeleyscanner.com/2024/06/20/traffic-safety/berkeley-cyclist-death-lawsuit-traffic-safety-questions/

Data presented
1) TP data from BPD

2) SWITRS data, with missing lat long added from TP crash record

3) SWITRS with any crashes from TP that are not already in SWITRS

4) TBD crashes from news that are neither in SWITRS nor in TP
example:


