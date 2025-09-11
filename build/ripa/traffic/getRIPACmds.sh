#!/bin/bash

echo "rm temp/*"

for year in {2020..2025}
do
  #echo "$year"
  echo "###### ${year} #########"
  echo "wget -O temp/traffic_stops_${year}.json 'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1) AND (Date_of_Stop LIKE %27${year}%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude'"
  echo "jq '.features |= sort_by(.attributes.DateTime_ISO) ' traffic_stops_${year}.json  >temp/ts_${year}.json"
  echo "grep -c Stop_GlobalID temp/ts_${year}.json"
  echo "cp  temp/ts_${year}.json ../../../data/stop"
done
