#!/bin/bash
set -e
echo "Removing downloaded and generated files"
mkdir -p temp/output || true
mkdir output || true
rm temp/urls temp/toc.html || true
rm temp/*.csv || true;
rm temp/output/* || true;

for YYYY in {2020..2025}; do
	url="'https://services7.arcgis.com/vIHhVXjE1ToSg0Fz/arcgis/rest/services/Merged_RIPA_view/FeatureServer/0/query?f=json&maxRecordCountFactor=5&cacheHint=tru&returnDistinctValues=true&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=(Primary_Reason_for_Stop__raw_=1)%20AND%20(DateTime_FME%20LIKE%20%27${YYYY}%25%27)&resultOffset=0000&&resultRecordCount=5000&outFields=Stop_GlobalID,Date_of_Stop,Time_of_Stop,DateTime_FME,DateTime_ISO,Type_Of_Stop,Perceived_Age,City_of_Residence,Resident,Primary_Reason_for_Stop__raw_,Primary_Reason_for_Stop__text_,Traffic_Violation_Type,Traffic_Violation_Offense_Code_,Result_of_Stop,Warning_Offense_Code_s_,Citation_Offense_Code_s_,Result_of_Stop_text,bGeoPointAddress,bGeneralLocationDesc,ReasonForStopNarrative,Latitude,Longitude&orderByFields=DateTime_FME'"
	cmd="wget -O temp/stop_${YYYY}.json $url"
	#echo $cmd
	eval $cmd
done

for year in {2020..2025}; do
  echo "check files for year ${year}"
  if [ ! -f temp/stop_${year}.json ]; then
    echo "Expected file  temp/stop_${year}.json  not found" 
  fi 
done

for year in {2020..2025}; do
  echo "Processing year ${year}"
  node  stopToJson.js   temp/stop_${year}.json   temp/output/ts_${year}.json | tee temp/log${year}
done

echo "look for output in temp/ouput/"
echo "bye"

