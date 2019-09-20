# load necessary packages 
libs <- c("tidyverse", "stringr", "readr", "dplyr", "ggplot2", "readstata13","foreign",
          "magrittr","lubridate","here","ggrepel","treemapify","packcircles", "ggalluvial","ggrepel",
          "extrafont","ggfittext","cowplot","googleway","ggspatial","sf","rnaturalearth",
          "rnaturalearthdata","rgeos","ggridges","jsonlite")

lapply(libs, library, character.only=TRUE)

# Read in the data
intake <- read.csv(here('SAO Data','Intake.csv'),stringsAsFactors = FALSE) 
initiation <- read.csv(here("SAO Data","Initiation.csv"),stringsAsFactors = FALSE) 
sentence <- read.csv(here("SAO Data","Sentencing.csv"),stringsAsFactors = FALSE) 
disposition <- read.csv(here("SAO Data","Dispositions.csv"),stringsAsFactors = FALSE) 

#################################### PREPARE DATA FOR BAR PLOTS ############################################# 

# Need to prepare Intake, Dispositions, and Sentencing data
# Want to filter all data only on those with non-missing Gender/Race values because each chart will have
# that breakdown. Also want to limit dispositions and sentences data only to the "primary" charge or 
# topline charge - this is consistent with how SAO analyze their data as well, and captures the most
# severe charge. 

# Since the CCSAO website makes it very clear that these files do NOT track the same cases over time, and should
# be interpreted as separate snapshots, merging these datasets to see the evolution of a particular case may
# give misleading numbers. Instead, I will merge to see if there is a general pattern that makes sense (e.g. cases
# that are rejected in intake should ideally not have any/many dispositions). 

# Clean Intake Data
# There are 2 relevant variables - participant status and Felony Review result. participant status is the final
# status of a case brought against a person but it doesn't necessarily come from Felony Review since Narcotics cases
# are filed directly by Law Enforcement agencies. Accordingly, will make "clean" variable:
  # case status detailed using FR Result variable and assuming all narcotics are filed by LEA - 
  # approved by felony review, filed by LEA (narcotics), rejected, continuing investigation, other
  # will use variable 2 for D3 for now
# Numbers match CCSAO Dashboard if I dont filter for missing race/gender

intake %<>% 
  filter(GENDER %in% c("Male","Female")) %>%
  filter(RACE %in% c("Albino", "American Indian", "Asian", "ASIAN", "Biracial", "Black", "CAUCASIAN", "HISPANIC",
                    "Unknown", "White", "White [Hispanic or Latino]", "White/Black [Hispanic or Latino]")) %>%
  mutate(RECEIVED_DATE = as.Date(RECEIVED_DATE,'%m/%d/%Y')) %>%
  mutate(receive_month = round_date(RECEIVED_DATE, "month")) %>% 
  mutate(FR_DATE = as.Date(FR_Date,'%m/%d/%Y')) %>% 
  mutate(FR_year = year(FR_DATE)) %>%  
  mutate(FR_year = year(FR_DATE)) %>% 
  mutate(receive_year = year(RECEIVED_DATE)) %>% 
  mutate(ARREST_DATE = as.Date(ARREST_DATE,'%m/%d/%Y')) %>% 
  mutate(arrest_year = year(ARREST_DATE)) %>%   
  mutate(Offense_Category_broad = case_when(
    grepl("Retail Theft", Offense_Category) ~ "Retail Theft",
    grepl("Burglary", Offense_Category) ~ "Burglary",
    grepl("Homicide", Offense_Category) ~ "Homicide",
    grepl("Robbery", Offense_Category) ~ "Robbery",
    grepl("Battery", Offense_Category) ~ "Battery",
    grepl("Assault", Offense_Category) ~ "Battery",
    grepl("DUI", Offense_Category) ~ "DUI",
    grepl("UUW", Offense_Category) ~ "Unlawful Use \n of Weapon",
    Offense_Category == "Theft" ~ "Theft\n (Non-retail)",
    Offense_Category == "Narcotics" ~ "Narcotics",
    Offense_Category == "Sex Crimes" ~ "Sex Crimes",
    Offense_Category == "Possession of Stolen Motor Vehicle" ~ "MVT",
    Offense_Category == "Driving With Suspended Or Revoked License" ~ "Driving With \n Revoked License",
    TRUE ~ "Other (e.g. Forgery, \n Identity Theft)"    
  )) %>% 
  mutate(Race_short = case_when(
        RACE == "Black" ~ "Black",
        RACE == "White" ~ "White",
        RACE == "CAUCASIAN" ~ "White",
        RACE == "HISPANIC" ~ "Latinx",
        RACE == "White [Hispanic or Latino]" ~ "Latinx",
        RACE == "White/Black [Hispanic or Latino]" ~ "Latinx",
        RACE == "Unknown" ~ "Other",
        TRUE ~ "Other"
      )) %>% 
  mutate(initiation_result = case_when(
  grepl("Approved", FR_RESULT) ~ "Approved",
  grepl("Rejected", FR_RESULT) ~ "Rejected",
  grepl("Continued Investigation", FR_RESULT) ~ "Continued Investigation",
  FR_RESULT == "" & Offense_Category == "Narcotics" ~ "Filed by LEA",
  FR_RESULT == "" & Offense_Category != "Narcotics" ~ "Other",
  TRUE ~ "Other"))

# intake_noG_R <- intake %>% 
#   filter(!RACE %in% c("Albino", "American Indian", "Asian", "ASIAN", "Biracial", "Black", "CAUCASIAN", "HISPANIC",
#                     "Unknown", "White", "White [Hispanic or Latino]", "White/Black [Hispanic or Latino]")) %>% 
#   count(RACE)
#   
# intake_noFR <- intake %>% 
#   mutate(initiation_result = case_when(
#     grepl("Approved", FR_RESULT) ~ "Approved",
#     grepl("Rejected", FR_RESULT) ~ "Rejected",
#     grepl("Continued Investigation", FR_RESULT) ~ "Other",
#     FR_RESULT == "" & Offense_Category == "Narcotics" ~ "Filed by LEA",
#     FR_RESULT == "" & Offense_Category != "Narcotics" ~ "",
#     TRUE ~ "Other"
#   )) %>% 
#   filter(initiation_result!="") %>% 
#   mutate(Race_short = case_when(
#     RACE == "Black" ~ "Black",
#     RACE == "White" ~ "White",
#     RACE == "CAUCASIAN" ~ "White",
#     RACE == "HISPANIC" ~ "Latinx",
#     RACE == "White [Hispanic or Latino]" ~ "Latinx",
#     RACE == "White/Black [Hispanic or Latino]" ~ "Latinx",
#     RACE == "Unknown" ~ "Other",
#     TRUE ~ "Other"
#   ))
# 
# intake_FR_count <- intake %>%
#   filter(initiation_result=="Other") %>% 
#   filter(receive_year==2017)
# 
# 
# intake_noFR_count2 <- intake %>% 
#   count(PARTICIPANT_STATUS) %>% 
#   mutate(pct = n / sum(n) * 100)

  
# Cases approved vs rejected - Default 
intake_year_status <- intake %>% 
  group_by(receive_year,initiation_result) %>% 
  summarise(cases = n()) %>% 
  filter(receive_year > 2010 & receive_year < 2020) %>% 
  spread(initiation_result, cases) %>% 
  rename(Year=receive_year)

write_json(intake_year_status,here("processed_data","intake_year_status.json"))

# Cases approved vs rejected - by gender
intake_year_status_gender <- intake %>% 
  group_by(receive_year,initiation_result, GENDER) %>% 
  summarise(cases = n()) %>% 
  filter(receive_year > 2010 & receive_year < 2020) %>% 
  spread(GENDER,cases) %>% 
  rename(Year=receive_year)

write_json(intake_year_status_gender,here("processed_data","intake_year_status_gender.json"))

# Cases approved vs rejected - by race
intake_year_status_race <- intake %>% 
  group_by(receive_year,initiation_result, Race_short) %>% 
  summarise(cases = n()) %>% 
  filter(receive_year > 2010 & receive_year < 2020) %>% 
  spread(Race_short,cases) %>% 
  rename(Year=receive_year)

# Cases approved vs rejected - by offense category
intake_year_status_offense <- intake %>% 
  group_by(receive_year,initiation_result, Offense_Category_broad) %>% 
  summarise(cases = n()) %>% 
  filter(receive_year > 2010 & receive_year < 2020) %>% 
  spread(Offense_Category_broad,cases) %>% 
  rename(Year=receive_year)

write_json(intake_year_status_race,here("processed_data","intake_year_status_race.json"))

intake_year_race_gender <- inner_join(intake_year_status_gender,intake_year_status_race,by=c("Year","initiation_result"))

write_json(intake_year_race_gender,here("processed_data","intake_year_race_gender.json"))

############################################# PLOT 2 ############################################# 

# The total number of cases per year match online CCSAO dashboard, but there's a huge discrepancy between nolle prosecution and plea
# guilty. Consistently, the online dashboard has about 5-6k more cases in plea guilty than the data i've downloaded. e.g. 2018
# there are ~16,000 plea guilty and ~8,000 Nolle Prosecution. In the data downloaded (not the dashboard), I have ~12,000 Plea Guilty
# and ~12,000 Nolle Prosecution. Since this is a pattern throughout, there might be an update between the july 2019 data and the
# data presented (updated sept 2019) that explains this. May need to follow up with CCSAO about this

# disposition_charges <- disposition %>%
#   filter(PRIMARY_CHARGE == "true") %>%
#   mutate(CHARGE_DISPOSITION = trimws(CHARGE_DISPOSITION)) %>% 
#   mutate(DISPO_DATE = as.Date(DISPO_DATE,'%m/%d/%Y')) %>%
#   mutate(dispo_year = year(DISPO_DATE)) %>%  
#   mutate(conviction_d = case_when(
#     CHARGE_DISPOSITION == "Plea Of Guilty" ~ "Plea Of Guilty",
#     CHARGE_DISPOSITION == "Finding Guilty" ~ "Finding Guilty",
#     CHARGE_DISPOSITION == "Verdict Guilty" ~ "Verdict Guilty",
#     CHARGE_DISPOSITION == "Plea of Guilty - Amended Charge" ~ "Plea Of Guilty",
#     
#     CHARGE_DISPOSITION == "Nolle Prosecution" ~ "Nolle Prosecution",
#     CHARGE_DISPOSITION == "FNPC" ~ "Finding No Probably Cause",
#     CHARGE_DISPOSITION == "FNG" ~ "Finding - Not Guilty",
#     CHARGE_DISPOSITION == "Verdict-Not Guilty" ~ "Verdict - Not Guilty",
#     CHARGE_DISPOSITION == "Case Dismissed" ~ "No Conviction - Other",
#     CHARGE_DISPOSITION == "Finding Not Not Guilty" ~ "No Conviction - Other",
#     CHARGE_DISPOSITION == "FNG Reason Insanity" ~ "No Conviction - Other",
#     
#     CHARGE_DISPOSITION == "Death Suggested-Cause Abated" ~ "No Conviction - Other",
#     CHARGE_DISPOSITION == "BFW" ~ "No Conviction - Other",
#     CHARGE_DISPOSITION == "Transferred - Misd Crt" ~ "No Conviction - Other",
#     TRUE ~ ""
#   )) %>% 
#   mutate(conviction = ifelse(conviction=="",NA,conviction)) %>% 
#   mutate(conviction_d = ifelse(conviction_d=="",NA,conviction_d)) %>% 
#   group_by(dispo_year, conviction_d) %>% 
#   summarise(cases = n()) %>% 
#   spread(conviction_d,cases)

# Clean up dispositions data
# As per the 2017 Data report, Dispositions should be filtered only on the primary charge (one per case participant ID)
# because each case participant can have many charges against them but summarizing all of those would be 
# too complicated. the primary charge reflects the most serious charge

disposition %<>%
  filter(PRIMARY_CHARGE == "true") %>%
  filter(GENDER %in% c("Male","Female")) %>%
  filter(RACE %in% c("Albino", "American Indian", "Asian", "ASIAN", "Biracial", "Black", "CAUCASIAN", "HISPANIC",
                     "Unknown", "White", "White [Hispanic or Latino]", "White/Black [Hispanic or Latino]")) %>%
  mutate(CHARGE_DISPOSITION = trimws(CHARGE_DISPOSITION)) %>% 
  mutate(DISPO_DATE = as.Date(DISPO_DATE,'%m/%d/%Y')) %>%
  mutate(dispo_month = round_date(DISPO_DATE, "month")) %>% 
  mutate(dispo_year = year(DISPO_DATE)) %>%  
  mutate(RECEIVED_DATE = as.Date(RECEIVED_DATE,'%m/%d/%Y')) %>%
  mutate(receive_month = round_date(RECEIVED_DATE, "month")) %>% 
  mutate(receive_year = year(RECEIVED_DATE)) %>% 
  mutate(conviction = case_when(
    CHARGE_DISPOSITION == "Plea Of Guilty" ~ "Conviction",
    CHARGE_DISPOSITION == "Finding Guilty" ~ "Conviction",
    CHARGE_DISPOSITION == "Verdict Guilty" ~ "Conviction",
    CHARGE_DISPOSITION == "Plea of Guilty - Amended Charge" ~ "Conviction",
    
    CHARGE_DISPOSITION == "Nolle Prosecution" ~ "No Conviction",
    CHARGE_DISPOSITION == "FNPC" ~ "No Conviction",
    CHARGE_DISPOSITION == "FNG" ~ "No Conviction",
    CHARGE_DISPOSITION == "Verdict-Not Guilty" ~ "No Conviction",
    CHARGE_DISPOSITION == "Case Dismissed" ~ "No Conviction",
    CHARGE_DISPOSITION == "Finding Not Not Guilty" ~ "No Conviction",
    CHARGE_DISPOSITION == "FNG Reason Insanity" ~ "No Conviction",
    
    CHARGE_DISPOSITION == "Death Suggested-Cause Abated" ~ "No Conviction",
    CHARGE_DISPOSITION == "BFW" ~ "No Conviction",
    CHARGE_DISPOSITION == "Transferred - Misd Crt" ~ "No Conviction",
    TRUE ~ ""
  )) %>% 
  mutate(conviction_d = case_when(
    CHARGE_DISPOSITION == "Plea Of Guilty" ~ "Plea Of Guilty",
    CHARGE_DISPOSITION == "Finding Guilty" ~ "Finding Guilty",
    CHARGE_DISPOSITION == "Verdict Guilty" ~ "Verdict Guilty",
    CHARGE_DISPOSITION == "Plea of Guilty - Amended Charge" ~ "Plea Of Guilty",
    
    CHARGE_DISPOSITION == "Nolle Prosecution" ~ "Nolle Prosecution",
    CHARGE_DISPOSITION == "FNPC" ~ "Finding No Probably Cause",
    CHARGE_DISPOSITION == "FNG" ~ "Finding - Not Guilty",
    CHARGE_DISPOSITION == "Verdict-Not Guilty" ~ "Verdict - Not Guilty",
    CHARGE_DISPOSITION == "Case Dismissed" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "Finding Not Not Guilty" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "FNG Reason Insanity" ~ "No Conviction - Other",
    
    CHARGE_DISPOSITION == "Death Suggested-Cause Abated" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "BFW" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "Transferred - Misd Crt" ~ "No Conviction - Other",
    TRUE ~ ""
  )) %>% 
  mutate(conviction = ifelse(conviction=="",NA,conviction)) %>% 
  mutate(conviction_d = ifelse(conviction_d=="",NA,conviction_d)) %>% 
  filter(!is.na(conviction)) %>% 
  mutate(Race_short = case_when(
    RACE == "Black" ~ "Black",
    RACE == "White" ~ "White",
    RACE == "CAUCASIAN" ~ "White",
    RACE == "HISPANIC" ~ "Latinx",
    RACE == "White [Hispanic or Latino]" ~ "Latinx",
    RACE == "White/Black [Hispanic or Latino]" ~ "Latinx",
    RACE == "Unknown" ~ "Other",
    TRUE ~ "Other"
  )) 

# Cases convicted/not convicted - Default 
dispo_year_status <- disposition %>% 
  group_by(dispo_year,conviction) %>% 
  summarise(cases = n_distinct(CASE_PARTICIPANT_ID)) %>% 
  filter(dispo_year > 2010 & dispo_year < 2020) %>% 
  spread(conviction, cases) %>% 
  rename(Year=dispo_year)

write_json(dispo_year_status,here("processed_data","dispo_year_status.json"))

# Cases convicted/not convicted - by conviction detailed
dispo_year_status_conviction_d <- disposition %>% 
  group_by(dispo_year,conviction,conviction_d) %>% 
  summarise(cases = n()) %>% 
  filter(dispo_year > 2010 & dispo_year < 2020) %>% 
  spread(conviction_d, cases) %>% 
  rename(Year=dispo_year)

write_json(dispo_year_status_conviction_d,here("processed_data","dispo_year_status_conviction_d.json"))

# Cases convicted/not convicted - by Gender
dispo_year_status_gender <- disposition %>% 
  group_by(dispo_year,conviction,GENDER) %>% 
  summarise(cases = n()) %>% 
  filter(dispo_year > 2010 & dispo_year < 2020) %>% 
  spread(GENDER, cases) %>% 
  rename(Year=dispo_year)

write_json(dispo_year_status_gender,here("processed_data","dispo_year_status_gender.json"))

# Cases convicted/not convicted - by Race
dispo_year_status_race <- disposition %>% 
  group_by(dispo_year,conviction,Race_short) %>% 
  summarise(cases = n()) %>% 
  filter(dispo_year > 2010 & dispo_year < 2020) %>% 
  spread(Race_short, cases) %>% 
  rename(Year=dispo_year) 

write_json(dispo_year_status_race,here("processed_data","dispo_year_status_race.json"))

dispo_year_race_gender <- inner_join(dispo_year_status_gender,dispo_year_status_race,by=c("Year","conviction"))

write_json(dispo_year_race_gender,here("processed_data","dispo_year_race_gender.json"))


############################################# PLOT 3 ############################################# 

# Clean up sentencing data
# As per the CC SAO Data report, Sentences should NOT be filtered only on the primary charge (one per case participant ID)
# For many case participants, the primary charge may not receive a conviction (e.g. might be nolle'd) but
# that doesnt mean that case participant won't receive a sentence because some of the lower charges
# may receive a conviction and then therefore a sentence. So to summarize this data, we use n_distinct(Case participant ID)

sentence %<>%
  #filter(PRIMARY_CHARGE == "true") %>%
  filter(GENDER %in% c("Male","Female")) %>%
  filter(RACE %in% c("Albino", "American Indian", "Asian", "ASIAN", "Biracial", "Black", "CAUCASIAN", "HISPANIC",
                     "Unknown", "White", "White [Hispanic or Latino]", "White/Black [Hispanic or Latino]")) %>%
  mutate(RECEIVED_DATE = as.Date(RECEIVED_DATE,'%m/%d/%Y')) %>%
  mutate(receive_month = round_date(RECEIVED_DATE, "month")) %>% 
  mutate(receive_year = year(RECEIVED_DATE)) %>% 
  mutate(SENTENCE_DATE = as.Date(SENTENCE_DATE,'%m/%d/%Y')) %>%
  mutate(sentence_month = round_date(SENTENCE_DATE, "month")) %>% 
  mutate(sentence_year = year(SENTENCE_DATE)) %>% 
  mutate(Race_short = case_when(
    RACE == "Black" ~ "Black",
    RACE == "White" ~ "White",
    RACE == "CAUCASIAN" ~ "White",
    RACE == "HISPANIC" ~ "Latinx",
    RACE == "White [Hispanic or Latino]" ~ "Latinx",
    RACE == "White/Black [Hispanic or Latino]" ~ "Latinx",
    RACE == "Unknown" ~ "Other",
    TRUE ~ "Other"
  )) %>% 
  mutate(sentence_type_short = case_when(
    SENTENCE_TYPE=="Prison" ~ "Prison",
    SENTENCE_TYPE=="Probation" ~ "Probation",
    SENTENCE_TYPE=="Jail" ~ "Jail",
    TRUE ~ "Other Sentence"
  ))

# sentence_count <- sentence %>% 
#   count(SENTENCE_TYPE) %>% 
#   mutate(pct = n / sum(n) * 100)
# Coding this as prison, probation, jail, and other. the first three categories capture about 94% 
# of all categories

# Sentence Types - Default 
sent_year_status <- sentence %>% 
  group_by(sentence_year,sentence_type_short) %>% 
  summarise(cases = n_distinct(CASE_PARTICIPANT_ID)) %>% 
  filter(sentence_year > 2010 & sentence_year < 2020) %>% 
  spread(sentence_type_short, cases) %>% 
  rename(Year=sentence_year)

write_json(sent_year_status,here("processed_data","sent_year_status.json"))


# Sentence Types - Gender  
sent_year_status_gender <- sentence %>% 
  group_by(sentence_year,sentence_type_short,GENDER) %>% 
  summarise(cases = n_distinct(CASE_PARTICIPANT_ID)) %>% 
  filter(sentence_year > 2010 & sentence_year < 2020) %>% 
  spread(GENDER, cases) %>% 
  rename(Year=sentence_year)

write_json(sent_year_status_gender,here("processed_data","sent_year_status_gender.json"))


# Sentence Types - Race  
sent_year_status_race <- sentence %>% 
  group_by(sentence_year,sentence_type_short,Race_short) %>% 
  summarise(cases = n_distinct(CASE_PARTICIPANT_ID)) %>% 
  filter(sentence_year > 2010 & sentence_year < 2020) %>% 
  spread(Race_short, cases) %>% 
  rename(Year=sentence_year)

write_json(sent_year_status_race,here("processed_data","sent_year_status_race.json"))

sent_year_race_gender <- inner_join(sent_year_status_gender,sent_year_status_race,by=c("Year","sentence_type_short"))

write_json(sent_year_race_gender,here("processed_data","sent_year_race_gender.json"))


############################################# FOR SANKEY ############################################# 

intake_for_join <- intake %>% 
  select(CASE_PARTICIPANT_ID,receive_year,initiation_result)


disposition <- read.csv(here("SAO Data","Dispositions.csv"),stringsAsFactors = FALSE) 

disposition %<>%
  #filter(PRIMARY_CHARGE == "true") %>%
  filter(GENDER %in% c("Male","Female")) %>%
  filter(RACE %in% c("Albino", "American Indian", "Asian", "ASIAN", "Biracial", "Black", "CAUCASIAN", "HISPANIC",
                     "Unknown", "White", "White [Hispanic or Latino]", "White/Black [Hispanic or Latino]")) %>%
  mutate(CHARGE_DISPOSITION = trimws(CHARGE_DISPOSITION)) %>% 
  mutate(DISPO_DATE = as.Date(DISPO_DATE,'%m/%d/%Y')) %>%
  mutate(dispo_month = round_date(DISPO_DATE, "month")) %>% 
  mutate(dispo_year = year(DISPO_DATE)) %>%  
  mutate(RECEIVED_DATE = as.Date(RECEIVED_DATE,'%m/%d/%Y')) %>%
  mutate(receive_month = round_date(RECEIVED_DATE, "month")) %>% 
  mutate(receive_year = year(RECEIVED_DATE)) %>% 
  mutate(conviction = case_when(
    CHARGE_DISPOSITION == "Plea Of Guilty" ~ "Conviction",
    CHARGE_DISPOSITION == "Finding Guilty" ~ "Conviction",
    CHARGE_DISPOSITION == "Verdict Guilty" ~ "Conviction",
    CHARGE_DISPOSITION == "Plea of Guilty - Amended Charge" ~ "Conviction",
    
    CHARGE_DISPOSITION == "Nolle Prosecution" ~ "No Conviction",
    CHARGE_DISPOSITION == "FNPC" ~ "No Conviction",
    CHARGE_DISPOSITION == "FNG" ~ "No Conviction",
    CHARGE_DISPOSITION == "Verdict-Not Guilty" ~ "No Conviction",
    CHARGE_DISPOSITION == "Case Dismissed" ~ "No Conviction",
    CHARGE_DISPOSITION == "Finding Not Not Guilty" ~ "No Conviction",
    CHARGE_DISPOSITION == "FNG Reason Insanity" ~ "No Conviction",
    
    CHARGE_DISPOSITION == "Death Suggested-Cause Abated" ~ "No Conviction",
    CHARGE_DISPOSITION == "BFW" ~ "No Conviction",
    CHARGE_DISPOSITION == "Transferred - Misd Crt" ~ "No Conviction",
    TRUE ~ ""
  )) %>% 
  mutate(conviction_d = case_when(
    CHARGE_DISPOSITION == "Plea Of Guilty" ~ "Plea Of Guilty",
    CHARGE_DISPOSITION == "Finding Guilty" ~ "Finding Guilty",
    CHARGE_DISPOSITION == "Verdict Guilty" ~ "Verdict Guilty",
    CHARGE_DISPOSITION == "Plea of Guilty - Amended Charge" ~ "Plea Of Guilty",
    
    CHARGE_DISPOSITION == "Nolle Prosecution" ~ "Nolle Prosecution",
    CHARGE_DISPOSITION == "FNPC" ~ "Finding No Probably Cause",
    CHARGE_DISPOSITION == "FNG" ~ "Finding - Not Guilty",
    CHARGE_DISPOSITION == "Verdict-Not Guilty" ~ "Verdict - Not Guilty",
    CHARGE_DISPOSITION == "Case Dismissed" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "Finding Not Not Guilty" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "FNG Reason Insanity" ~ "No Conviction - Other",
    
    CHARGE_DISPOSITION == "Death Suggested-Cause Abated" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "BFW" ~ "No Conviction - Other",
    CHARGE_DISPOSITION == "Transferred - Misd Crt" ~ "No Conviction - Other",
    TRUE ~ ""
  )) %>% 
  mutate(conviction = ifelse(conviction=="",NA,conviction)) %>% 
  mutate(conviction_d = ifelse(conviction_d=="",NA,conviction_d)) %>% 
  filter(!is.na(conviction)) %>% 
  mutate(Race_short = case_when(
    RACE == "Black" ~ "Black",
    RACE == "White" ~ "White",
    RACE == "CAUCASIAN" ~ "White",
    RACE == "HISPANIC" ~ "Latinx",
    RACE == "White [Hispanic or Latino]" ~ "Latinx",
    RACE == "White/Black [Hispanic or Latino]" ~ "Latinx",
    RACE == "Unknown" ~ "Other",
    TRUE ~ "Other"
  )) 

disposition_max_conviction <- disposition %>% 
  mutate(conviction_number = ifelse(conviction=="Conviction",1,0)) %>% 
  select(CASE_PARTICIPANT_ID,PRIMARY_CHARGE,dispo_year,conviction,conviction_number) %>% 
  # filtering to the "max" of conviction vs no conviction, rather than topline charge
  group_by(CASE_PARTICIPANT_ID) %>% 
  filter(conviction_number==max(conviction_number)) %>% 
  select(CASE_PARTICIPANT_ID,dispo_year,conviction,conviction_number) %>% 
  distinct()


# dispo_for_join <- disposition %>% 
#   select(CASE_PARTICIPANT_ID,dispo_year,conviction)

# intake_dispo_join <- full_join(intake_for_join, disposition_max_conviction,by="CASE_PARTICIPANT_ID") %>% 
#   filter(is.na(receive_year)) %>% 
#   group_by(dispo_year) %>% 
#   summarise(cases = n())

# about 7% of the dispositions data is missing receive year when I do a join (approx 22k cases). 15k of these cases
# are from 2011 (disposition year). This makes sense since this data is only supposed to be reliable from 2011 onwards
# i.e. cases that make it to dispositions may not show up in the universe of intake data if they were
# initiated before 2011.
# will only keep cases NOT missing receive_year - so the dashboard sankey will show cases flow that initiated in 
# 2011 or later


# 
# intake_dispo_join2 <- intake_dispo_join %<>%
#   ungroup() %>% 
#   select(initiation_result, conviction, cases) %>% 
#   mutate(case = "Cases") %>% 
#   mutate(conviction = replace_na(conviction,"Pending"))  
#   # mutate(conviction = gsub(" ",'',conviction)) %>% 
#   # mutate(initiation_result = gsub(" ",'',initiation_result)) 

# https://markhneedham.com/blog/2014/11/10/r-maximum-value-row-in-each-group/

# write_json(intake_dispo_join2,here("processed_data","intake_dispo_join.json"))

# Deal with joining intake with disposition
# First filter cases missing receive year i.e. initiated before 2011
# Then categorize cases missing disposition as Pending IF they have been approved or continued investigation or
# Filed By LEA. This is an assumption we're making - filed by LEA or continued investigation may not have reached
# disposition stage at all and may have been rejected, but since we don't know, PENDING seems like a safe guess

# Next I filter out those that are still missing conviction (i.e. Other or Rejected that don't show up in disposition)
# The assumption here being that those cases are not PENDING, but didn't proceed further in the system

# Summarizing this gives us the flow of cases from intake into conviction, removing cases that should have
# "stopped" after intake

# NOTE - i'm joining intake with disposition_max_conviction. In the CC SAO data / reports, they discuss only
# looking at the topline charge in the dispositions file. While this makes sense in some cases, it really
# doesn't make sense when combining dispositions with sentences data. This is because while the topline
# charge may not receive a conviction for a given case_participant, another charge for the same case_participant
# might, and that conviction will receive a sentence. For the purposes of tracking case-participants from 
# intake to sentencing, it is therefore confusing to see many cases get "no convictions" and then many of the
# "no convictions" receive sentences.

# Instead, I think it makes more sense to count a conviction if ANY charges for a given case_participant
# result in a conviction, because then it follows that that case_participant would receive a sentence
intake_dispo_join2 <- full_join(intake_for_join, disposition_max_conviction,by="CASE_PARTICIPANT_ID") %>% 
  filter(!is.na(receive_year)) %>% 
  mutate(case_participant = "Case Participants") %>% 
  mutate(conviction2 = case_when(
    is.na(conviction) & initiation_result %in% c("Approved","Continued Investigation", "Filed by LEA") ~ "Pending",
    TRUE ~ conviction
  )) %>% 
  filter(!is.na(conviction2)) %>% 
  group_by(receive_year,case_participant,initiation_result,conviction2) %>% 
  summarise(cases = n()) %>% 
  #filter(receive_year==2017)  %>% 
  ungroup() %>%
  group_by(receive_year,initiation_result,conviction2) %>% 
  select(receive_year,initiation_result,conviction2,cases) %>% 
  rename(source=initiation_result,target=conviction2,value=cases)
# The source here is initiation results that flow into conviction, and the target is convictions

# Here I summarize all intake cases 
# So the source here will be "all cases" and the target will be initiation results
intake_dispo_join_NA <- intake_for_join %>% 
  filter(!is.na(receive_year)) %>% 
  mutate(case_participant = "Case Participants") %>% 
  group_by(receive_year,case_participant,initiation_result) %>% 
  summarise(cases = n()) %>% 
  #filter(receive_year==2017) %>% 
  # ungroup() %>% 
  select(receive_year,case_participant,initiation_result,cases) %>% 
  rename(source=case_participant,target=initiation_result,value=cases)

# now, intake and disposition are ready and just need to be appended to each other

# Next, need to do something similar with dispositions and sentences data

# Prepare sentences for joining by keeping unique rows of Case Participant IDs and sentence type
sent_for_join <- sentence %>%
  select(CASE_PARTICIPANT_ID,sentence_year,sentence_type_short) %>%
  distinct()

# First do a full join of intake, dispositions, and sentences. At this point, all datasets
# should be unique on case participant ID because dispositions_max_conviction should only contain
# wheher a case participant received ANY conviction
intake_dispo_join <- full_join(intake_for_join, disposition_max_conviction,by="CASE_PARTICIPANT_ID")
sent_intake_dispo_join <- full_join(intake_dispo_join, sent_for_join,by="CASE_PARTICIPANT_ID")

# Then we repeat the process from above to classify convictions as pending if intake was 
# approved, CI, or filed by LEA
# We'll do a similar process for convictions and sentences - i.e. if the participant received a conviction
# but isn't in the sentences dataset, we'll assume the sentence is pending. if the participant didn't 
# receive a conviction and isn't in the sentencing dataset, we'll assume that case ended there (as it should)
sent_intake_dispo_join %<>%
  filter(!is.na(receive_year)) %>% 
    mutate(case_participant = "Case Participants") %>% 
    mutate(conviction2 = case_when(
      is.na(conviction) & initiation_result %in% c("Approved","Continued Investigation", "Filed by LEA") ~ "Pending",
      TRUE ~ conviction
    )) %>% 
    filter(!is.na(conviction2)) %>% 
    mutate(sentence2 = case_when(
      is.na(sentence_type_short) & conviction2 %in% c("Conviction","Pending") ~ "Pending Sentence",
      TRUE ~ sentence_type_short
    )) %>% 
  filter(!is.na(sentence2)) %>%
    group_by(receive_year,conviction2,sentence2) %>% 
    summarise(cases = n()) %>% 
    #filter(receive_year==2017)  %>% 
    # ungroup() %>% 
    select(receive_year,conviction2,sentence2,cases) %>% 
    rename(source=conviction2,target=sentence2,value=cases)

sent_intake_dispo_join_final <- rbind(intake_dispo_join2,intake_dispo_join_NA,sent_intake_dispo_join) 

# sent_intake_dispo_join_final %<>% 
#   filter(value > 90)

write_json(sent_intake_dispo_join_final,here("processed_data","sent_intake_dispo_join_final.json"))


