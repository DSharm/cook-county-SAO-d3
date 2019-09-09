# load necessary packages 
libs <- c("tidyverse", "stringr", "readr", "dplyr", "ggplot2", "readstata13","foreign",
          "magrittr","lubridate","here","ggrepel","treemapify","packcircles", "ggalluvial","ggrepel",
          "extrafont","ggfittext","cowplot","googleway","ggspatial","sf","rnaturalearth",
          "rnaturalearthdata","rgeos","ggridges","jsonlite")

lapply(libs, library, character.only=TRUE)

# Read in the data
intake <- read.csv(here('data_source','SAO Data','Intake.csv'),stringsAsFactors = FALSE) 
initiation <- read.csv(here("data_source","SAO Data","Initiation.csv"),stringsAsFactors = FALSE) 
sentence <- read.csv(here("data_source","SAO Data","Sentencing.csv"),stringsAsFactors = FALSE) 
disposition <- read.csv(here("data_source","SAO Data","Dispositions.csv"),stringsAsFactors = FALSE) 

############################################# PLOT 1 ############################################# 

intake %<>% 
  filter(GENDER %in% c("Male","Female")) %>%
  filter(RACE %in% c("Albino", "American Indian", "Asian", "ASIAN", "Biracial", "Black", "CAUCASIAN", "HISPANIC",
                    "Unknown", "White", "White [Hispanic or Latino]", "White/Black [Hispanic or Latino]")) %>% 
  mutate(RECEIVED_DATE = as.Date(RECEIVED_DATE,'%m/%d/%Y')) %>% 
  mutate(receive_month = round_date(RECEIVED_DATE, "month")) %>% 
  mutate(FR_DATE = as.Date(FR_Date,'%m/%d/%Y')) %>% 
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
  mutate(initiation_result = case_when(
    grepl("Approved", FR_RESULT) ~ "Approved",
    grepl("Rejected", FR_RESULT) ~ "Rejected",
    grepl("Continued Investigation", FR_RESULT) ~ "Continued Investigation",
    FR_RESULT == "" ~ "Filed by LEA",
    TRUE ~ "Other"
  )) %>% 
  mutate(Race_short = case_when(
    RACE == "Black" ~ "Black",
    RACE == "White" ~ "White",
    RACE == "CAUCASIAN" ~ "White",
    RACE == "HISPANIC" ~ "Latinx",
    RACE == "White [Hispanic or Latino]" ~ "Latinx",
    RACE == "White/Black [Hispanic or Latino]" ~ "Latinx",
    RACE == "Unknown" ~ "Unknown",
    TRUE ~ "Other"
  ))

# Cases approved vs rejected - Default 
intake_year_status <- intake %>% 
  group_by(receive_year,initiation_result) %>% 
  summarise(cases = n()) %>% 
  filter(receive_year > 2010 & receive_year < 2019) %>% 
  spread(initiation_result, cases) %>% 
  rename(Year=receive_year)

write_json(intake_year_status,here("CC Dashboard","processed_data","intake_year_status.json"))


# Cases approved vs rejected - by gender
intake_year_status_gender <- intake %>% 
  group_by(receive_year,initiation_result, GENDER) %>% 
  summarise(cases = n()) %>% 
  filter(receive_year > 2010 & receive_year < 2019) %>% 
  spread(GENDER,cases) %>% 
  rename(Year=receive_year)

write_json(intake_year_status_gender,here("CC Dashboard","processed_data","intake_year_status_gender.json"))


# Cases approved vs rejected - by race
intake_year_status_race <- intake %>% 
  group_by(receive_year,initiation_result, Race_short) %>% 
  summarise(cases = n()) %>% 
  filter(receive_year > 2010 & receive_year < 2019) %>% 
  rename(Year=receive_year)

write_json(intake_year_status_race,here("CC Dashboard","processed_data","intake_year_status_race.json"))



  