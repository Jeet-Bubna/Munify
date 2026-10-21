from django.db import models
from datetime import date

class MUN(models.Model):
    """
    Model for different MUNS
    ### Fields
    `id`: automatic
    `name`: name of the mun
    `location`: location
    `date`: date of the mun (to be entered by form, default: datetime.date.today)
    `description`:description
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField()
    location = models.TextField()
    date = models.DateField(default=date.today)
    description = models.TextField()

class Committees(models.Model):
    """
    Model for different committees. 
    ### Fields
    `id`:automatically created
    `mun_id`: id of the mun
    `agenda`: agenda of the committee
    `name`: name of the committee. (unsc, aippm, unhrc, etc)
    """
    id = models.AutoField(primary_key=True)
    mun = models.ForeignKey(MUN, on_delete=models.CASCADE)
    agenda = models.TextField(default="default_agenda")
    name = models.CharField()

class MarkScheme(models.Model):
    """
    Model for marking scheme
    ### Fields
    `id`: Automatically created
    `committee_id`: id of the committee whose marksheet this is
    `category`: category of marking (speeches, points, or sub categories like 
    GSL, MOD, POI, POO, etc.) can and should vary with chairs
    """
    id = models.AutoField(primary_key=True)
    committee_id = models.ForeignKey(Committees, on_delete=models.CASCADE)
    category = models.CharField()
    max_marks = models.PositiveSmallIntegerField()

class Sessions(models.Model):
    """
    Model for managing the sessions of a committee
    ### Fields
    `id`: Automatically created
    `committee_id`: Id of the committee.
    `session_no`: The session number
    `started_at`: Automatically created
    """
    id = models.AutoField(primary_key=True)
    committee_id = models.ForeignKey(Committees, on_delete=models.CASCADE)
    session_no = models.PositiveSmallIntegerField()
    started_at = models.DateTimeField(auto_now_add=True)

class Chairs(models.Model):
    """
    Model containing inormation about the chair(s) of a commmittee
    ### Fields
    `id`: automatically generated
    `committee_id`: id of the committee
    `name`: name of the chair
    `email`: email of the chair
    `password_hash`: Hashed password of the chair, used in login
    """
    id = models.AutoField(primary_key=True)
    committee_id = models.ForeignKey(Committees, on_delete=models.CASCADE)
    name = models.CharField()
    email = models.EmailField()
    password_hash = models.CharField(max_length=255)

class Delegates(models.Model):
    """
    Model containign the basic information about delegates.
    ### Fields
    `id`: Automatically genereated
    `committee_id`: id of the committee
    `name`: name of the delegate
    `portfolio`: portfolio of the delegate 
    """
    id = models.AutoField(primary_key=True)
    committee_id = models.ForeignKey(Committees, on_delete=models.CASCADE)
    name = models.CharField()
    portfolio = models.CharField()

class Motions(models.Model):
    """
    Model containing the information about the motions
    ### Fields
    `id`: Automatically generated
    `session_id`: id of the curent session
    `raised_by_id`: id of the delegate who raised the motion
    `motion_type`: type of motion (formal session, GSL, mod, etc)
    `motion_agenda`: agenda of the motion
    `number_of_speakers`: number of speakers set to speak in the motion
    `time_per_speaker`: time (in seconds) given to each speaker to deliver their speech
    `raised_at`: Automatically generated
    """
    id = models.AutoField(primary_key=True)
    session_id = models.ForeignKey(Sessions, on_delete=models.CASCADE)
    raised_by_id = models.ForeignKey(Delegates, on_delete=models.CASCADE)
    motion_type = models.CharField()
    motion_passed = models.BooleanField()
    motion_agenda = models.TextField()
    number_of_speakers = models.PositiveSmallIntegerField()
    time_per_speaker = models.PositiveSmallIntegerField()
    raised_at = models.DateTimeField(auto_now_add=True)

class Points(models.Model):
    """
    Model containing the information regarding the points raised by a delegate
    ### Fields
    `id`: Automatically generted
    `motion_id`: id of the motion where it was raised
    `delegate_from_id`: which delegate raised the point
    `delegate_to_id`: delegate whose speech the point was rasied
    `point_type`: the type of point raised (poo, poi, etc)
    `marks_awarded`: marks awarded
    `rasied_at`: automatically generated
    """
    id = models.AutoField(primary_key=True)
    motion_id = models.ForeignKey(Motions, on_delete=models.CASCADE)
    delegate_from_id = models.ForeignKey(Delegates, on_delete=models.CASCADE, related_name="points_set_from")
    delegate_to_id = models.ForeignKey(Delegates, on_delete=models.CASCADE, related_name="points_set_to")
    point_type = models.CharField()
    marks_awarded = models.PositiveSmallIntegerField()
    raised_at = models.DateTimeField(auto_now_add=True)

class SpeakerList(models.Model):
    """
    Model continaing the informatoin regaring the speakers list
    ### Fields
    `id`: Automatic
    `motion_id`: id of the ongoing motion
    `delegate_id`: id of the delegate
    `position`: position of the delegate
    `has_spoken`: whether the delegate has spoken
    """
    id = models.AutoField(primary_key=True)
    motion_id = models.ForeignKey(Motions, on_delete=models.CASCADE)
    delegate_id = models.ForeignKey(Delegates, on_delete=models.CASCADE)
    position = models.PositiveSmallIntegerField()
    has_spoken = models.BooleanField(default=False)

class Scores(models.Model):
    """
    Model which keeps track of the scores
    ### Fields
    `id`: automatic
    `delegate_id`: id of the delegate
    `marks_awarded`: marks awarded for the speeches (equal to the sum)
    `remarks`: remarks by the chair after the entire conference (optional)
    """
    id = models.AutoField(primary_key=True)
    delegate_id = models.ForeignKey(Delegates, on_delete=models.CASCADE)
    session_id = models.ForeignKey(Sessions, on_delete=models.CASCADE)
    marks_awarded = models.PositiveSmallIntegerField()
    remarks = models.TextField()

class RollCall(models.Model):
    """
    Model containing the information about the attendence of the delegates
    ### Fields
    `id`: automatic
    `session_id`: session id for the roll call (when multiple days are there)
    `delegate_id`: id of the delegate
    `present`: is he present
    """
    id = models.AutoField(primary_key=True)
    session_id = models.ForeignKey(Sessions, on_delete=models.CASCADE)
    delegate_id = models.ForeignKey(Delegates, on_delete=models.CASCADE)
    present = models.BooleanField(default=False)

class Speech(models.Model):
    """
    Model containing information about the speech of the delegate
    ### Fields
    `id`: automatic
    `delegate_id`: id of the delegate
    `motion_id`: motion in which the speech was given
    `feedback`: feedback given by chair (if any)
    `spoken_at`: automatic
    """
    id = models.AutoField(primary_key=True)
    delegate_id = models.ForeignKey(Delegates, on_delete=models.CASCADE)
    motion_id = models.ForeignKey(Motions, on_delete=models.CASCADE)
    feedback = models.TextField()
    marks_awarded = models.PositiveSmallIntegerField()
    spoken_at = models.DateTimeField()