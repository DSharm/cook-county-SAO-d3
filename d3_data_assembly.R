# load necessary packages 
libs <- c("tidyverse", "stringr", "readr", "dplyr", "ggplot2", "readstata13","foreign",
          "magrittr","lubridate","here","ggrepel","treemapify","packcircles", "ggalluvial","ggrepel",
          "extrafont","ggfittext","cowplot","googleway","ggspatial","sf","rnaturalearth",
          "rnaturalearthdata","rgeos","ggridges","jsonlite")

lapply(libs, library, character.only=TRUE)

# Read in the data
intake <- read.csv(here('CC Dashboard','SAO Data','Intake.csv'),stringsAsFactors = FALSE) 
initiation <- read.csv(here('CC Dashboard',"SAO Data","Initiation.csv"),stringsAsFactors = FALSE) 
sentence <- read.csv(here('CC Dashboard',"SAO Data","Sentencing.csv"),stringsAsFactors = FALSE) 
disposition <- read.csv(here('CC Dashboard',"SAO Data","Dispositions.csv"),stringsAsFactors = FALSE) 



################################################################################################################
###################################################################################################
############################################################################################################

# Steps:
#   1) Clean each data set individually
#   2) Make dataset unique on CASE PARTICIPANT ID level
#   3) Merge intake, dispositions, and sentencing data
#   4) make adjustments for "Pending data"
#   5) Collapse in different ways - for sankey, by race, by gender


# Clean Intake Data
# There are 2 relevant variables - participant status and Felony Review result. participant status is the final
# status of a case brought against a person but it doesn't necessarily come from Felony Review since Narcotics cases
# are filed directly by Law Enforcement agencies. Accordingly, will make "clean" variable:
# case status detailed using FR Result variable and assuming all narcotics are filed by LEA - 
# approved by felony review, filed by LEA (narcotics), rejected, continuing investigation, other
# will use variable 2 for D3 for now
# Numbers match CCSAO Dashboard if I dont filter for missing race/gender

# Intake
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

intake_for_join <- intake %>% 
  select(CASE_PARTICIPANT_ID,receive_year,initiation_result,Race_short,GENDER)


# Disposition 
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

disposition_max_conviction_receive <- disposition %>% 
  mutate(conviction_number = ifelse(conviction=="Conviction",1,0)) %>% 
  select(CASE_PARTICIPANT_ID,PRIMARY_CHARGE,receive_year,conviction,conviction_number) %>% 
  # filtering to the "max" of conviction vs no conviction, rather than topline charge
  group_by(CASE_PARTICIPANT_ID) %>% 
  filter(conviction_number==max(conviction_number)) %>% 
  select(CASE_PARTICIPANT_ID,receive_year,conviction,conviction_number) %>% 
  distinct() %>% 
  select(CASE_PARTICIPANT_ID,conviction,conviction_number) 

# Clean up sentencing data
# As per the CC SAO Data report, Sentences should NOT be filtered only on the primary charge (one per case participant ID)
# For many case participants, the primary charge may not receive a conviction (e.g. might be nolle'd) but
# that doesnt mean that case participant won't receive a sentence because some of the lower charges
# may receive a conviction and then therefore a sentence. So to summarize this data, we use n_distinct(Case participant ID)


# Sentences
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


# In the sentences dataset, there are about 6,900 duplicates on CASE PARTICIPANT IDS when we take "distinct" on CPI, receive year
# and sentence type short. This appears to be because in some cases, a case participant DOES receive 2 different sentences - one
# original and one at resentencing or during probation violation. So instead i think I should do the following:
# group by case participant ID, select the LATEST sentence date, THEN make it distinct - even if there are still multiple charges
# at the latest date they should be receivign the same sentence

sent_for_join_receive <- sentence %>%
  group_by(CASE_PARTICIPANT_ID) %>%
  filter(SENTENCE_DATE == max(SENTENCE_DATE)) %>% 
  select(CASE_PARTICIPANT_ID,receive_year,sentence_type_short) %>%
  distinct() %>% 
  select(CASE_PARTICIPANT_ID,sentence_type_short)

# After doing this, still 200 duplicates left which don't seem to make sense (no reason for same case, same day to receive)
# 2 sentences. The number is so small, I'm going to drop these observations

sent_for_join_receive <- sent_for_join_receive[!duplicated(sent_for_join_receive$CASE_PARTICIPANT_ID),]

# 
# duplicates <- sent_for_join_receive[duplicated(sent_for_join_receive$CASE_PARTICIPANT_ID),]
# 
# sent_for_join_receive2 <- sentence %>%
#   select(CASE_PARTICIPANT_ID,receive_year) %>%
#   distinct()
# 
# sent_for_join_receive <- sentence %>%
#   group_by(CASE_PARTICIPANT_ID) %>%
#   filter(SENTENCE_DATE == max(SENTENCE_DATE)) %>% 
#   filter(CASE_PARTICIPANT_ID==173015444916)
#   
#   select(CASE_PARTICIPANT_ID, sentence_type_short)

# Combine intake, disposition, sentences

intake_for_join_years <- intake_for_join %>% 
  count(receive_year)


intake_dispo_join <- full_join(intake_for_join, disposition_max_conviction_receive,by="CASE_PARTICIPANT_ID")

intake_dispo_join_NA <- intake_dispo_join %>%  filter(is.na(conviction)) %>% group_by(receive_year,initiation_result) %>% summarise(cases=n())


sent_intake_dispo_join <- full_join(intake_dispo_join, sent_for_join_receive,by="CASE_PARTICIPANT_ID")

# Make adjustments on full dataset to deal with "pending" cases

# Difference between clean1 and clean2 is coming from the fact that some CASE PARTICIPANT IDS become duplicate
# when intake_dispo_join is merged with sentence, because the sentence dataset is not unique on case
# participant ID (in theory it should be, but about 1.7% of observations get duplicated since they might have
# 2 different sentence types for the same year and case participant)

# I think the cleanest thing to do is make sentence type dataset unique on CPI (select in the case of duplicates)
# and then merge
# intake_dispo_join_clean3 <- anti_join(intake_dispo_join_clean2,intake_dispo_join_clean1,by="CASE_PARTICIPANT_ID")
# 
# intake_dispo_join_clean3_yearsX <- intake_dispo_join_clean3 %>% 
#   count(receive_year.x)
# 
# intake_dispo_join_clean3_yearsY <- intake_dispo_join_clean3 %>% 
#   count(receive_year.y)

# Clean1 and clean2 match!!! as they should!!!

sent_intake_dispo_join %<>%
  # Remove cases missing receive_year i.e. cases that exist in dispositions/sentences but not in 
  # intake because they were initiated mostly before 2011 (before data was clean)
  filter(!is.na(receive_year)) %>% 
  mutate(case_participant = "Case Participants") %>% 
  mutate(conviction2 = case_when(
    is.na(conviction) & initiation_result %in% c("Approved","Continued Investigation", "Filed by LEA") ~ "Pending Conviction",
    TRUE ~ conviction
  )) %>% 
  # Remove those missing conviction2 i.e. not in dispositions dataset and not pending
  # About 21,000 obs over 8 years, ~15k of which are Rejected and 6k are other
  filter(!is.na(conviction2)) 

# Dataset 1 for sankey
intake_dispo_join_clean <- sent_intake_dispo_join %>% 
  group_by(receive_year,initiation_result,conviction2) %>% 
  summarise(cases = n()) %>% 
  rename(source=initiation_result,target=conviction2,value=cases)

# Dataset 2 for sankey
intake_all <- intake_dispo_join %>% 
  mutate(case_participant = "Case Participants") %>% 
  group_by(receive_year,initiation_result,case_participant) %>% 
  filter(!is.na(receive_year)) %>% 
  summarise(cases = n()) %>% 
  rename(source=case_participant,target=initiation_result,value=cases)

# Dataset 3 for sankey
sentence_dispo_join_clean <- sent_intake_dispo_join %>% 
  mutate(sentence2 = case_when(
    is.na(sentence_type_short) & conviction2 %in% c("Conviction","Pending Conviction") ~ "Pending Sentence",
    TRUE ~ sentence_type_short
  )) %>% 
  # remove those missing sentence2 i.e. not in sentences dataset and not pending a sentence (i.e. they dont 
  # belong in this dataset to begin with)
  filter(!is.na(sentence2)) %>%
  group_by(receive_year,conviction2,sentence2) %>% 
  summarise(cases = n()) %>% 
  #filter(receive_year==2017)  %>% 
  # ungroup() %>% 
  select(receive_year,conviction2,sentence2,cases) %>% 
  rename(source=conviction2,target=sentence2,value=cases)

sent_intake_dispo_join_final <- rbind(intake_dispo_join_clean,intake_all,sentence_dispo_join_clean) 

write_json(sent_intake_dispo_join_final,here("CC Dashboard", "processed_data","sent_intake_dispo_join_final.json"))

## Now create intake race/gender, disposition race/gender, and sentence race/gender from the same
# Intake
intake_year_status_gender <- sent_intake_dispo_join %>% 
  group_by(receive_year,initiation_result,GENDER) %>% 
  summarise(cases = n()) %>%
  spread(GENDER,cases) %>% 
  rename(Year=receive_year)

write_json(intake_year_status_gender,here("CC Dashboard","processed_data","intake_year_status_gender.json"))

intake_year_status_race <- sent_intake_dispo_join %>% 
  group_by(receive_year,initiation_result,Race_short) %>% 
  summarise(cases = n()) %>%
  spread(Race_short,cases) %>% 
  rename(Year=receive_year)

write_json(intake_year_status_race,here("CC Dashboard", "processed_data","intake_year_status_race.json"))
  
# Disposition
disp_year_status_gender <- sent_intake_dispo_join %>% 
  group_by(receive_year,conviction2,GENDER) %>% 
  summarise(cases = n()) %>%
  spread(GENDER,cases) %>% 
  rename(Year=receive_year,conviction=conviction2)

write_json(disp_year_status_gender,here("CC Dashboard","processed_data","disp_year_status_gender.json"))

disp_year_status_race <- sent_intake_dispo_join %>% 
  group_by(receive_year,conviction2,Race_short) %>% 
  summarise(cases = n()) %>%
  spread(Race_short,cases) %>% 
  rename(Year=receive_year,conviction=conviction2)

write_json(disp_year_status_race,here("CC Dashboard","processed_data","disp_year_status_race.json"))

# Sentence
sent_year_status_gender <- sent_intake_dispo_join %>% 
  mutate(sentence2 = case_when(
  is.na(sentence_type_short) & conviction2 %in% c("Conviction","Pending Conviction") ~ "Pending Sentence",
  TRUE ~ sentence_type_short
)) %>% 
  # remove those missing sentence2 i.e. not in sentences dataset and not pending a sentence (i.e. they dont 
  # belong in this dataset to begin with)
  filter(!is.na(sentence2)) %>%
  group_by(receive_year,sentence2,GENDER) %>% 
  summarise(cases = n()) %>% 
  spread(GENDER,cases) %>% 
  rename(Year=receive_year,sentence_type_short=sentence2)

write_json(sent_year_status_gender,here("CC Dashboard","processed_data","sent_year_status_gender.json"))


sent_year_status_race <- sent_intake_dispo_join %>% 
  mutate(sentence2 = case_when(
    is.na(sentence_type_short) & conviction2 %in% c("Conviction","Pending Conviction") ~ "Pending Sentence",
    TRUE ~ sentence_type_short
  )) %>% 
  # remove those missing sentence2 i.e. not in sentences dataset and not pending a sentence (i.e. they dont 
  # belong in this dataset to begin with)
  filter(!is.na(sentence2)) %>%
  group_by(receive_year,sentence2,Race_short) %>% 
  summarise(cases = n()) %>% 
  spread(Race_short,cases) %>% 
  rename(Year=receive_year,sentence_type_short=sentence2)

write_json(sent_year_status_race,here("CC Dashboard","processed_data","sent_year_status_race.json"))

intake_year_race_gender <- inner_join(intake_year_status_gender,intake_year_status_race,by=c("Year","initiation_result"))
write_json(intake_year_race_gender,here("CC Dashboard","processed_data","intake_year_race_gender.json"))

dispo_year_race_gender <- inner_join(disp_year_status_gender,disp_year_status_race,by=c("Year","conviction"))
write_json(dispo_year_race_gender,here("CC Dashboard","processed_data","dispo_year_race_gender.json"))

sent_year_race_gender <- inner_join(sent_year_status_gender,sent_year_status_race,by=c("Year","sentence_type_short"))
write_json(sent_year_race_gender,here("CC Dashboard","processed_data","sent_year_race_gender.json"))

