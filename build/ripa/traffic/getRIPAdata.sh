rm temp/*
###### 2020 #########
wget -O temp/traffic_stops_2020.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %272020%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'
jq '.features |= sort_by(.attributes.DateTime_ISO) ' temp/traffic_stops_2020.json  >temp/ts_2020.json
grep -c Stop_GlobalID temp/ts_2020.json
cp  temp/ts_2020.json ../../../data/stop
###### 2021 #########
wget -O temp/traffic_stops_2021.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %272021%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'
jq '.features |= sort_by(.attributes.DateTime_ISO) ' temp/traffic_stops_2021.json  >temp/ts_2021.json
grep -c Stop_GlobalID temp/ts_2021.json
cp  temp/ts_2021.json ../../../data/stop
###### 2022 #########
wget -O temp/traffic_stops_2022.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %272022%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'
jq '.features |= sort_by(.attributes.DateTime_ISO) ' temp/traffic_stops_2022.json  >temp/ts_2022.json
grep -c Stop_GlobalID temp/ts_2022.json
cp  temp/ts_2022.json ../../../data/stop
###### 2023 #########
wget -O temp/traffic_stops_2023.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %272023%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'
jq '.features |= sort_by(.attributes.DateTime_ISO) ' temp/traffic_stops_2023.json  >temp/ts_2023.json
grep -c Stop_GlobalID temp/ts_2023.json
cp  temp/ts_2023.json ../../../data/stop
###### 2024 #########
wget -O temp/traffic_stops_2024.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %272024%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'
jq '.features |= sort_by(.attributes.DateTime_ISO) ' temp/traffic_stops_2024.json  >temp/ts_2024.json
grep -c Stop_GlobalID temp/ts_2024.json
cp  temp/ts_2024.json ../../../data/stop
###### 2025 #########
wget -O temp/traffic_stops_2025.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %272025%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'
jq '.features |= sort_by(.attributes.DateTime_ISO) ' temp/traffic_stops_2025.json  >temp/ts_2025.json
grep -c Stop_GlobalID temp/ts_2025.json
cp  temp/ts_2025.json ../../../data/stop
