### Entity Types ###
BUSINESS = "Business"
ACCOUNTANT = "Accountant"
PRACTICE = "Practice"
ACCOUNTANT_FIRM = "Accountant Firm"
CUSTOMER = "Customer"
EMPLOYEE = "Employee"

### User Types ###
BUSINESS_USER = "Business_User"
PRACTICE_USER = "Practice_User"

### Role code_names ###
SU = "su"
PA = "pa"
BA = "ba"
BUA = "bua"
BS = "bs"
CA = "ca"
PS = "ps"

### Status Constants ###
PENDING = "Pending"
ACCEPTED = "Accepted"
REJECTED = "Rejected"
REVOKED = "Revoked"
SUSPENDED = "Suspended"
EXPIRED = "Expired"
PROCESSING = "Processing"
READY = "Ready"
IN_REVIEW = "In Review"
PENDING_APPROVAL = "Pending Approval"
APPROVED = "Approved"
ARCHIVED = "Archived"
ACTIVE = "Active"
INACTIVE = "Inactive"
DEACTIVATED = "Deactivated"
INVITED = "Invited"
RE_ACTIVATED = "re-activated"

### Document Status ###
DRAFT = "draft"
PUBLISHED = "published"
SCHEDULED = "scheduled"
SENDING = "sending"
SENT = "sent"
PAUSED = "paused"
CANCELLED = "cancelled"

### Visibility Options ###
PUBLIC = "public"
PRIVATE = "private"
PASSWORD = "password"
MEMBERS = "members"

### Content Types ###
IMAGE = "image"
VIDEO = "video"
AUDIO = "audio"
DOCUMENT = "document"
OTHER = "other"

### Email Status ###
UNSUBSCRIBED = "unsubscribed"
BOUNCED = "bounced"
SPAM = "spam"

### Newsletter Types ###
NEWSLETTER = "newsletter"
PROMOTION = "promotion"
ANNOUNCEMENT = "announcement"
WELCOME = "welcome"

### Financial Constants ###
SALE = "Sale"
COST = "Cost"
STATEMENT = "Statement"
SUCCEEDED = "Succeeded"
FAILED = "Failed"
REFUNDED = "Refunded"
PAID = "Paid"
CASH = "Cash"
USD = "USD"

### Message Types ###
WARNING = "Warning"
ERROR = "Error"
INFO = "info"
SUCCESS = "Success"

### Subscription Packages ###
BUSINESS_STARTER = "Business Starter"
BUSINESS_CUSTOMIZE = "Business Customize"
PRACTICE_ESSENTIAL = "Practice Essential"
PRACTICE_ADVANCE = "Practice Advance"
BUSINESS_TRIAL = "Business Trial"
NORMAL = "Normal"
COMMERCE_LITE = "Commerce Lite"

### Package Codes ###
BT = "bt"
BC = "bc"
PT = "pt"
PE = "pe"

### Frequency Options ###
DAILY = "daily"
WEEKLY = "weekly"
MONTHLY = "Monthly"
ANNUALLY = "Annually"

### HTTP Methods ###
GET = "GET"
POST = "POST"
PATCH = "PATCH"
DELETE = "DELETE"

### Operations ###
LIST = "list"
DEACTIVATE = "Deactivate"
REACTIVATE = "Reactivate"
CREATE = "Create"
UPDATE = "Update"
MOVE = "Move"
ONBOARDING = "Onboarding"

### Product Status ###
SOLD = "Sold"
NOT_SOLD = "Not Sold"

### Sale Types ###
BUY_NOW = "Buy Now"
AUCTION = "Auction"

### Image Positions ###
FRONT = "Front"
BACK = "Back"
LOGO = "Logo"
HERO_IMAGE = "Hero_Image"

### Image Types ###
PERSONAL = "Personal"
PROCESSED = "Processed"

### Special Permissions ###
ALL_DOCS = "access_all_documents"
READ_USER_PER = "read_user"
READ_ACCOUNTANT_PER = "read_accountant"
INVITE_CLIENT_PER = "invite_client"
READ_BANK_ACCOUNT_PER = "read_bank_account"
READ_PAYMENT_METHOD_PER = "read_payment_method"
READ_CLIENT_PER = "read_client"
BUY_SUBSCRIPTION_PER = "buy_subscription"
CREATE_USER = "create_user"
CREATE_DOCUMENT = "create_document"
ACCESS_ALL_DOCUMENTS = "access_all_documents"

### Settings Permissions ###
BUSINESS_SETTINGS = "business_settings"
SHOW_BUSINESS_SETTINGS = "show_business_settings"
READ_SUBSCRIPTION = "read_subscription"

### Feature Lists ###
FEATURE_ALERT_LIST = [CREATE_USER, CREATE_DOCUMENT]
ALERT_LIST = [BUSINESS_SETTINGS, SHOW_BUSINESS_SETTINGS, READ_SUBSCRIPTION]
EXTENDED_ALERT_FEATURE_LIST = [*FEATURE_ALERT_LIST, *ALERT_LIST]

### Modules ###
SUBSCRIPTION = "Subscription"
USER = "User"
TRIAL = "Trial"
DOCUMENT = "Document"
DOCUMENT_MOVE = "Document_Move"

### Document Activity Logs ###
CREATED = "Created"
UPDATED = "Updated"
MOVED = "Moved"
DELETED = "Deleted"

### Stripe Events ###
EVENT_CHECKOUT_SESSION_COMPLETED = "checkout.session.completed"
EVENT_INVOICE_PAID = "invoice.paid"

### Email Templates ###
ACCOUNT_ACTIVATION = "account_activation"
FORGET_PASSWORD_EMAIL_TEMP = "forget_password"
TRIAL_EXPIRED_EMAIL = "trial_expired"
SUBSCRIPTION_EXPIRED = "subscription_expired"
ACCOUNTANT_INVITATION = "accountant_invitation"
CLIENT_INVITATION = "client_invitation"
USER_INVITATION = "user_invitation"
USER_DEACTIVATED_EMAIL_TEMP = "user_deactivated"
USER_RE_ACTIVATED_EMAIL_TEMP = "user_reactivated"
USER_DELETE_EMAIL_TEMP = "user_delete"
SUBSCRIPTION_PURCHASED = "subscription_purchased"
FEATURE_LIMIT_REACHING_SOON = "feature_limit_reaching_soon"
ACCOUNTANT_DEACTIVATE_EMAIL = "accountant_deactivated"
ACCOUNTANT_REACTIVATE_EMAIL = "accountant_reactivated"
LOGIN_VERIFY_EMAIL = "login_verify"
CLIENT_DELETE_EMAIL = "client_delete"

### Notification Templates ###
DOCUMENT_CREATED = "Document Created"
DOCUMENT_MOVED = "Document Moved"
DOCUMENT_DELETED = "Document Deleted"
DOCUMENT_UPDATED = "Document Updated"
WORKSPACE_INVITATION = "Workspace Invitation"
CLIENT_INVITATION_NOTIFY = "Client Invitation"
WORKSPACE_INVITATION_NEW_USER = "Workspace Invitation New"
DELETE_USER = "Delete User"
DEACTIVATE_USER = "Deactivate User"
BANK_ACCOUNT_CREATE = "Bank Account Create"
BANK_ACCOUNT_UPDATE = "Bank Account Update"
BANK_ACCOUNT_DELETE = "Bank Account Delete"
PAYMENT_METHOD_CREATE = "Payment Method Create"
PAYMENT_METHOD_UPDATE = "Payment Method Update"
PAYMENT_METHOD_DELETE = "Payment Method Delete"
ACCOUNTANT_DEACTIVATE = "Accountant Deactivate"
ACCOUNTANT_REACTIVATE = "Accountant Reactivate"
BUSINESS_USER_ONBOARDING_NOTIFICATION = "User Onboarding"
PRACTICE_USER_ONBOARDING_NOTIFICATION = "Colleague Onboarding"
ACCOUNTANT_ONBOARDING_NOTIFICATION = "Accountant Onboarding"
CLIENT_ONBOARDING_NOTIFICATION = "Client Onboarding"
REACTIVATE_USER = "Reactivate User"
UPDATE_CLIENT_NOTIFY = "Update Client"
DELETE_CLIENT_NOTIFY = "Delete Client"

### Text Constants ###
YOU = "you"
HAS = "has"
HAVE = "have"

### URL Paths ###
B_to_A_B_URL = "/business-settings?where=accountant"
A_to_B_A_URL = "/invitations"
TO_BUSINESS_USER_URL = "/users"
TO_PRACTICE_USER_URL = "/teams"

### Security ###
OTP = "otp"
QR_CODE = "qr_code"

### File Formats ###
RGB = "RGB"
JPEG = "JPEG"
PDF_EXT = ".pdf"
PDF = "pdf"
ZIP_EXT = ".zip"
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp")

### Timezone ###
UTC = "UTC"