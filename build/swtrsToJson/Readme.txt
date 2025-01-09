request raw data from swtrs for Berkeley
get Accident and Party txt files -- note new local case id column

create a new db
imprort Accident csv as collsion
import Party csv as party


Create views




Drop view if exists Involved_Objects;
CREATE VIEW Involved_Objects as 
SELECT case_id,
       group_concat(stwd_vehicle_type, '/') AS Involved_Objects
FROM (SELECT Case_ID, 

CASE
     WHEN stwd_vehicle_type == 'A' THEN 'Car'
     WHEN  stwd_vehicle_type == 'C' THEN 'Motorcycle'
	  WHEN  (stwd_vehicle_type == 'D' or stwd_vehicle_type == 'F') THEN 'Truck'
	   WHEN   (stwd_vehicle_type == 'H' or stwd_vehicle_type == 'I')  THEN 'Bus'
	    WHEN  stwd_vehicle_type == 'L'	THEN 'Bicycle'
		
		 WHEN  stwd_vehicle_type == 'M'	THEN 'Pedestrian'
      ELSE 'NOT STATED' 
END stwd_vehicle_type

from party


 ORDER BY Case_ID,stwd_vehicle_type)
GROUP BY Case_Id;


 select  Collision.Case_ID as Case_ID,
 Primary_Rd || ' / ' || Secondary_Rd as Accident_Location, Latitude as Latitude, Longitude as Longitude, 
 Collision_Date as Date, Collision_Time as Time, cast( substr(Collision_date,1,4) as INT) as Year,
number_injured as Number_of_Injuries,
number_killed  as Number_of_Fatalities,
Involved_Objects.Involved_Objects, 

CASE
     WHEN PARTY_TYPE == 1 THEN 'Driver'
     WHEN  PARTY_TYPE == 2 THEN 'Pedestrian'
	  WHEN  PARTY_TYPE == 3 THEN 'PARKED VEH'
	   WHEN  PARTY_TYPE == 4 THEN 'Bicylist'
	    WHEN  PARTY_TYPE == 5 THEN 'OTHER'
      ELSE 'NOT STATED' 
END PARTY_AT_FAULT

--- Bicycle_Collision, Pedestrian_Collision, Motorcycle_Collision, Truck_Collision

from collision left join Involved_Objects on Collision.Case_ID  == Involved_Objects.Case_ID
left join party on (collision.Case_ID = party.Case_ID and At_Fault)

where Date >= '2015-01-01' 





