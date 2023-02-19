- SELECT first_name,
last_name
FROM patients
where allergies is NULL

- SELECT first_name,last_name
FROM patients
where weight>=100 and weight<=120

- update patients 
set allergies='NKA'
where allergies is NULL

- SELECT
  CONCAT(first_name, ' ', last_name) AS full_name
FROM patients;
### or
- select first_name || ' ' || last_name from patients

- select first_name,
    last_name,
    province_names.province_name
 from patients
inner join province_names on patients.province_id=province_names.province_id

- select count(first_name) from patients
where patients.birth_date like '%2010%'

or

- SELECT COUNT(*) AS total_patients
FROM patients
WHERE YEAR(birth_date) = 2010;

or

- SELECT count(first_name) AS total_patients
FROM patients
WHERE
  birth_date >= '2010-01-01'
  AND birth_date <= '2010-12-31'

- Q. Show the first_name, last_name, and height of the patient with the greatest height.
- select first_name,last_name,max(height) from patients
or
- SELECT
  first_name,
  last_name,
  height
FROM patients
WHERE height = (
    SELECT max(height)
    FROM patients
  )

- Q. 
- select * from patients
where patient_id=1 or patient_id=45 or patient_id=534 or patient_id=879 or patient_id=1000
or
- SELECT *
FROM patients
WHERE
  patient_id IN (1, 45, 534, 879, 1000);


- SELECT *
FROM admissions
WHERE admission_date = discharge_date;

- Q. Show the patient id and the total number of admissions for patient_id 579.
- SELECT
  patient_id,
  COUNT(*) AS total_admissions
FROM admissions
WHERE patient_id = 579;

- Q. Based on the cities that our patients live in, show unique cities that are in province_id 'NS'?
-   SELECT DISTINCT(city) AS unique_cities
FROM patients
WHERE province_id = 'NS';

- Q. Based on cities where our patient lives in, write a query to display the list of unique city starting with a vowel (a, e, i, o, u). Show the result order in ascending by city.

- select distinct city
from patients
where
  city like 'a%'
  or city like 'e%'
  or city like 'i%'
  or city like 'o%'
  or city like 'u%'
order by city


- Q. select distinct year(birth_date)
from patients
order by birth_date
or 
- SELECT year(birth_date)
FROM patients
GROUP BY year(birth_date)

- Q. Show unique first names from the patients table which only occurs once in the list.
For example, if two or more people are named 'John' in the first_name column then don't include their name in the output list. If only 1 person is named 'Leo' then include them in the output.

- select first_name
from patients
group by first_name
having count(first_name)=1

- Q. Show patient_id and first_name from patients where their first_name start and ends with 's' and is at least 6 characters long.

- SELECT
  patient_id,
  first_name
FROM patients
WHERE first_name LIKE 's____%s';
or
- SELECT
  patient_id,
  first_name
FROM patients
WHERE
  first_name LIKE 's%s'
  AND len(first_name) >= 6;
  or
- select patient_id, first_name
from patients
where first_name like 's%' and
first_name like '%s' and
len(first_name) >= 6

- Q. Show patient_id, first_name, last_name from patients whos diagnosis is 'Dementia'.
Primary diagnosis is stored in the admissions table.

- SELECT
  patients.patient_id,
  first_name,
  last_name
FROM patients
  JOIN admissions ON admissions.patient_id = patients.patient_id
WHERE diagnosis = 'Dementia';

- Q. Display every patient's first_name.
Order the list by the length of each name and then by alphbetically

- SELECT first_name from patients
order by len(first_name),first_name asc

- Q. Show the total amount of male patients and the total amount of female patients in the patients table.
Display the two results in the same row.

-------Imp-----
- SELECT 
  (SELECT count(*) FROM patients WHERE gender='M') AS male_count, 
  (SELECT count(*) FROM patients WHERE gender='F') AS female_count;
  ------------------------------
  or
  SELECT 
  SUM(Gender = 'M') as male_count, 
  SUM(Gender = 'F') AS female_count
FROM patients
or
- select 
  sum(case when gender = 'M' then 1 end) as male_count,
  sum(case when gender = 'F' then 1 end) as female_count 
from patients;

- Q. Show first and last name, allergies from patients which have allergies to either 'Penicillin' or 'Morphine'. Show results ordered ascending by allergies then by first_name then by last_name.

- SELECT
  first_name,
  last_name,
  allergies
FROM patients
WHERE
  allergies IN ('Penicillin', 'Morphine')
ORDER BY
  allergies,
  first_name,
  last_name;

  - SELECT
  first_name,
  last_name,
  allergies
FROM
  patients
WHERE
  allergies = 'Penicillin'
  OR allergies = 'Morphine'
ORDER BY
  allergies ASC,
  first_name ASC,
  last_name ASC;

- Q. Show patient_id, diagnosis from admissions. Find patients admitted multiple times for the same diagnosis.

- select patient_id,diagnosis from admissions
group by patient_id,diagnosis
having count(patient_id)>1

- Q. Show the city and the total number of patients in the city.
Order from most to least patients and then by city name ascending.

- select city,count(*) as total_patient from patients
group by city
order by total_patient desc, city asc


- Q. Show first name, last name and role of every person that is either patient or doctor.
The roles are either "Patient" or "Doctor"

- 