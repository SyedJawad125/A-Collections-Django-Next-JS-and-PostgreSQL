from django.db import models
from utils.reusable_classes import TimeUserStamps


class Categories(TimeUserStamps):
    category = models.CharField(max_length=50)
    
    def __str__(self):
        return self.category

# class Images(TimeUserStamps):
#     image = models.ImageField(upload_to='images/')
#     name = models.CharField(max_length=30, null=True, blank=True)
#     description = models.TextField(max_length=500, null=True, blank=True)
#     bulletsdescription = models.TextField(null=True, blank=True)
#     imagescategory = models.ForeignKey(Categories, on_delete=models.CASCADE, 
#                                      related_name='categoriesimages', 
#                                      null=True, blank=True)
    
#     def __str__(self):
#         return self.name if self.name else f"Image {self.id}"



class Images(TimeUserStamps):
    image = models.ImageField(upload_to='images/')
    name = models.CharField(max_length=30, null=True, blank=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    bulletsdescription = models.TextField(null=True, blank=True)
    imagescategory = models.ForeignKey(Categories, on_delete=models.CASCADE, 
                                     related_name='categoriesimages', 
                                     null=True, blank=True)
    is_active = models.BooleanField(default=True)  # Add this
    is_public = models.BooleanField(default=True)  # Add this for public visibility
    
    def __str__(self):
        return self.name if self.name else f"Image {self.id}"