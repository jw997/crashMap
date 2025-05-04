BPD publishes RIPA stop data on arcgis and graphs it on the Transparentcy portal.

There are many fields unrelated to traffic stops.

To get only the needed fields, the arcgis query has the outFields paramters
outFields=* gets all

The query output is limited to maxRecordCountFactor * maxRecordCount fields.  maxRecordCount is usually 1000.

arcgis uses a few weird date time formats

"Date_of_Stop": 1602226800000,
"Time_of_Stop": 1738567500000,
"DateTime_FME": "20201009232500-07:00",
"DateTime_ISO": 1599805500000,

starting in 2024, the FME format changes to 
"DateTime_FME": "2024-02-22 11:35:00",
        "DateTime_ISO": 1708630500000,

        

the FME format is bascially  YYYY/MM/DD HH:MM:SS-TZ with some of the separators removed
"2020/10/09 23:25:00-07:00",


we can use the FME format to make the same type of times fields the collision data has
 "Date": "2024-09-30",
 "Time": "09:35:00",
 "Year": 2024
        
example:

wget -O traffic_stops_2024.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %272024%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'
