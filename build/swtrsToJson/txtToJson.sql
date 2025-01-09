CREATE TABLE "Collision" (
	"case_id"	TEXT,
	"accident_year"	TEXT,
	"proc_date"	TEXT,
	"juris"	TEXT,
	"collision_date"	TEXT,
	"collision_time"	TEXT,
	"officer_id"	TEXT,
	"reporting_district"	TEXT,
	"day_of_week"	INTEGER,
	"chp_shift"	INTEGER,
	"population"	INTEGER,
	"cnty_city_loc"	INTEGER,
	"special_cond"	INTEGER,
	"beat_type"	INTEGER,
	"chp_beat_type"	TEXT,
	"city_division_lapd"	TEXT,
	"chp_beat_class"	INTEGER,
	"beat_number"	INTEGER,
	"primary_rd"	TEXT,
	"secondary_rd"	TEXT,
	"distance"	REAL,
	"direction"	TEXT,
	"intersection"	TEXT,
	"weather_1"	TEXT,
	"weather_2"	TEXT,
	"state_hwy_ind"	TEXT,
	"caltrans_county"	TEXT,
	"caltrans_district"	TEXT,
	"state_route"	TEXT,
	"route_suffix"	TEXT,
	"postmile_prefix"	TEXT,
	"postmile"	TEXT,
	"location_type"	TEXT,
	"ramp_intersection"	TEXT,
	"side_of_hwy"	TEXT,
	"tow_away"	TEXT,
	"collision_severity"	INTEGER,
	"number_killed"	INTEGER,
	"number_injured"	INTEGER,
	"party_count"	INTEGER,
	"primary_coll_factor"	TEXT,
	"pcf_code_of_viol"	TEXT,
	"pcf_viol_category"	INTEGER,
	"pcf_violation"	TEXT,
	"pcf_viol_subsection"	TEXT,
	"hit_and_run"	TEXT,
	"type_of_collision"	TEXT,
	"mviw"	TEXT,
	"ped_action"	TEXT,
	"road_surface"	TEXT,
	"road_cond_1"	TEXT,
	"road_cond_2"	TEXT,
	"lighting"	TEXT,
	"control_device"	TEXT,
	"chp_road_type"	INTEGER,
	"pedestrian_accident"	TEXT,
	"bicycle_accident"	TEXT,
	"motorcycle_accident"	TEXT,
	"truck_accident"	TEXT,
	"not_private_property"	TEXT,
	"alcohol_involved"	TEXT,
	"stwd_vehtype_at_fault"	TEXT,
	"chp_vehtype_at_fault"	TEXT,
	"count_severe_inj"	INTEGER,
	"count_visible_inj"	INTEGER,
	"count_complaint_pain"	INTEGER,
	"count_ped_killed"	INTEGER,
	"count_ped_injured"	INTEGER,
	"count_bicyclist_killed"	INTEGER,
	"count_bicyclist_injured"	INTEGER,
	"count_mc_killed"	INTEGER,
	"count_mc_injured"	INTEGER,
	"primary_ramp"	TEXT,
	"secondary_ramp"	TEXT,
	"latitude"	REAL,
	"longitude"	REAL,
	"local_report_number"	TEXT
);

.import --csv --skip 1 './Accident_243606.txt' 'collision'
.import --csv './Party_243606.txt' 'party'


update  collision set collision_time =   substr("0000" || collision_time,-4,4) 
where length( collision_time) < 4;

update collision set collision_time = substr(collision_time,1,2) || ':' ||  substr(collision_time,3,2) || ':00';


 update collision set collision_date =  substr(Collision_Date,1,4) || '-' || substr( collision_date, 5,2) || '-' || substr(collision_date, 7,2);
 
 update collision set longitude = -longitude where longitude > 0;
 

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
		
		 WHEN (party_type == 2 or  stwd_vehicle_type == 'M'	) THEN 'Pedestrian'
      ELSE 'NOT STATED' 
END stwd_vehicle_type

from party


 ORDER BY Case_ID,stwd_vehicle_type)
GROUP BY Case_Id;

select count(*) from Involved_Objects;

create view json_fields as 
select  Collision.Case_ID as Case_ID,
 Primary_Rd || ' / ' || Secondary_Rd as Accident_Location,
  cast( Latitude as Decimal) as Latitude,
  cast( Longitude as Decimal) as Longitude, 
 Collision_Date as Date, Collision_Time as Time, cast( substr(Collision_date,1,4) as INT) as Year,
cast(number_injured as INT) as Number_of_Injuries,
cast( number_killed as INT) as Number_of_Fatalities,
Involved_Objects.Involved_Objects, 
Collision.local_report_number as Local_Report_Number,

CASE
     WHEN PARTY_TYPE == 1 THEN 'Driver'
     WHEN  PARTY_TYPE == 2 THEN 'Pedestrian'
	  WHEN  PARTY_TYPE == 3 THEN 'PARKED VEH'
	   WHEN  PARTY_TYPE == 4 THEN 'Bicyclist'
	    WHEN  PARTY_TYPE == 5 THEN 'OTHER'
      ELSE 'NOT STATED' 
END Party_at_Fault

--- Bicycle_Collision, Pedestrian_Collision, Motorcycle_Collision, Truck_Collision

from collision left join Involved_Objects on Collision.Case_ID  == Involved_Objects.Case_ID
left join party on (collision.Case_ID = party.Case_ID and At_Fault='Y');

.mode json
.once swtrs.json
select * from json_fields;
.exit 1



