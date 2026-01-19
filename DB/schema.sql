
CREATE TABLE Active (
    ActiveLevelID INT PRIMARY KEY AUTO_INCREMENT,
    ActiveName VARCHAR(50) NOT NULL,
    Description TEXT ,
    ActiveFactor FLOAT NOT NULL
);


CREATE TABLE Goal (
    GoalID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL 
);


CREATE TABLE DietType (
    DietTypeID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    GoalType VARCHAR(50) NOT NULL,
    ActiveLevel VARCHAR(50) NOT NULL,
    ProteinRatio FLOAT NOT NULL,
    FatRatio FLOAT NOT NULL,
    CarbRatio FLOAT NOT NULL,
    CaloriesMultiplier FLOAT NOT NULL,
    Description TEXT
);


CREATE TABLE Diseases (
    DiseasesID INT PRIMARY KEY AUTO_INCREMENT,
    NameDis VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL
);


CREATE TABLE ServingUnit (
    UnitID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50),
    ToGramFact FLOAT
);

CREATE TABLE User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    BirthDate DATE NOT NULL,
    Gender VARCHAR(10) NOT NULL,
    Height FLOAT NOT NULL,
    CurrentWeight FLOAT NOT NULL,
    DesiredWeight FLOAT NOT NULL,
    DailyCalories FLOAT,
    JoinDate DATE NOT NULL,
    ActiveLevelID INT NOT NULL,
    GoalID INT NOT NULL,
    FOREIGN KEY (ActiveLevelID) REFERENCES Active(ActiveLevelID),
    FOREIGN KEY (GoalID) REFERENCES Goal(GoalID)
);

CREATE TABLE FoodItem (
    FoodItemID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Calories FLOAT NOT NULL,
    Protein FLOAT NOT NULL,
    Carbs FLOAT NOT NULL,
    Fats FLOAT NOT NULL,
    WeightInGram FLOAT NOT NULL,
    UnitID INT NOT NULL,
    Amount FLOAT NOT NULL
);

CREATE TABLE Meal (
    MealID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    MealTime TIME NOT NULL,
    Date DATETIME NOT NULL,
    TotalCalories FLOAT NOT NULL,
    Details TEXT NOT NULL
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

    


CREATE TABLE Contains (
    MealID INT NOT NULL,
    FoodItemID INT NOT NULL,
    Quantity FLOAT NOT NULL,
    TotalCalories FLOAT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    PRIMARY KEY (MealID, FoodItemID),
    FOREIGN KEY (MealID) REFERENCES Meal(MealID),
    FOREIGN KEY (FoodItemID) REFERENCES FoodItem(FoodItemID)
);

CREATE TABLE Image (
    ImageID INT PRIMARY KEY AUTO_INCREMENT,
    MealID INT NOT NULL,
    UploadTime DATETIME NOT NULL,
    AnalysisResult TEXT NOT NULL,
    ModelID INT NOT NULL
    FOREIGN KEY (MealID) REFERENCES Meal(MealID)
);


CREATE TABLE Model (
    ModelID INT PRIMARY KEY AUTO_INCREMENT,
    ModelName VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    UploadDate DATETIME NOT NULL,
    ModelFile VARCHAR(255) NOT NULL
);
CREATE TABLE DietRule (
    RuleID INT PRIMARY KEY AUTO_INCREMENT,
    DietTypeID INT NOT NULL,
    RuleLevel VARCHAR(50) NOT NULL,
    Value FLOAT NOT NULL,
    Operator VARCHAR(10) NOT NULL,
    Description TEXT NULL,
    FOREIGN KEY (DietTypeID) REFERENCES DietType(DietTypeID)
);

CREATE TABLE UserDiseases (
    UserID INT NOT NULL,
    DiseasesID INT NOT NULL,
    PRIMARY KEY (UserID, DiseasesID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (DiseasesID) REFERENCES Diseases(DiseasesID)
);

CREATE TABLE UserDietType (
    UserID INT NOT NULL,
    DietTypeID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Goal VARCHAR(100) NOT NULL,
    DailyCaloriesTarget FLOAT NOT NULL,
    ProteinTarget FLOAT NOT NULL,
    FatTarget FLOAT NOT NULL,
    CarbTarget FLOAT NOT NULL,
    PRIMARY KEY (UserID, DietTypeID, StartDate),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (DietTypeID) REFERENCES DietType(DietTypeID)
);

CREATE TABLE DietTypeDisease (
    DietTypeID INT NOT NULL,
    DiseasesID INT NOT NULL,
    Allow BOOLEAN NOT NULL,
    Allowance VARCHAR(100) NOT NULL,
    PRIMARY KEY (DietTypeID, DiseasesID),
    FOREIGN KEY (DietTypeID) REFERENCES DietType(DietTypeID),
    FOREIGN KEY (DiseasesID) REFERENCES Diseases(DiseasesID)
);

CREATE TABLE Tag (
    TagID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NULL
);

CREATE TABLE DietRuleTag (
    RuleID INT NOT NULL,
    TagID INT NOT NULL,
    PRIMARY KEY (RuleID, TagID),
    FOREIGN KEY (RuleID) REFERENCES DietRule(RuleID),
    FOREIGN KEY (TagID) REFERENCES Tag(TagID)
);

CREATE TABLE DietTypeFoodItem (
    DietTypeID INT NOT NULL,
    FoodItemID INT NOT NULL,
    Allow BOOLEAN NOT NULL,
    `Default` BOOLEAN NOT NULL,
    Allowance VARCHAR(100) NOT NULL,
    PRIMARY KEY (DietTypeID, FoodItemID),
    FOREIGN KEY (DietTypeID) REFERENCES DietType(DietTypeID),
    FOREIGN KEY (FoodItemID) REFERENCES FoodItem(FoodItemID)
);

CREATE TABLE DietRuleFoodItem (
    RuleID INT NOT NULL,
    FoodItemID INT NOT NULL,
    PRIMARY KEY (RuleID, FoodItemID),
    FOREIGN KEY (RuleID) REFERENCES DietRule(RuleID),
    FOREIGN KEY (FoodItemID) REFERENCES FoodItem(FoodItemID)
);