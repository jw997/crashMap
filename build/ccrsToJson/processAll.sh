#!/bin/bash

sed -i 's/\t//g' 20*crashes.csv 

for year in {2016..2025}; do
  echo "Processing year ${year}"
  node ccrsToJson.js  ${year}crashes.csv ${year}parties.csv ${year}iwp.csv  ccrs${year}.json
done
#exit 
#node ccrsToJson.js  2025crashes.csv 2025parties.csv 2025iwp.csv  ccrs2025.json
#node ccrsToJson.js  2024crashes.csv 2024parties.csv 2024iwp.csv  ccrs2024.json
#node ccrsToJson.js  2023crashes.csv 2023parties.csv 2023iwp.csv  ccrs2023.json
#node ccrsToJson.js  2022crashes.csv 2022parties.csv 2022iwp.csv  ccrs2022.json
#node ccrsToJson.js  2021crashes.csv 2021parties.csv 2021iwp.csv  ccrs2021.json
#node ccrsToJson.js  2020crashes.csv 2020parties.csv 2020iwp.csv  ccrs2020.json
#node ccrsToJson.js  2019crashes.csv 2019parties.csv 2019iwp.csv  ccrs2019.json
#node ccrsToJson.js  2018crashes.csv 2018parties.csv 2018iwp.csv  ccrs2018.json
#node ccrsToJson.js  2017crashes.csv 2017parties.csv 2017iwp.csv  ccrs2017.json
#node ccrsToJson.js  2016crashes.csv 2016parties.csv 2016iwp.csv  ccrs2016.json




